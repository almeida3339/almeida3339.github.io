import os
import re
from dotenv import load_dotenv
from telethon.sync import TelegramClient, events

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

# --- CONFIGURAÇÕES (lidas do arquivo .env) ---
try:
    API_ID = int(os.getenv('TG_API_ID'))
    API_HASH = os.getenv('TG_API_HASH')
    BOT_TOKEN = os.getenv('TG_BOT_TOKEN')
    DESTINATION_CHAT_ID = int(os.getenv('TG_CHAT_ID'))
    ids_str = os.getenv('SOURCE_CHANNEL_IDS')
    SOURCE_CHANNELS = [int(id_str.strip()) for id_str in ids_str.split(',')]
except (TypeError, ValueError) as e:
    print("ERRO: Verifique se todas as variáveis estão definidas corretamente no arquivo .env")
    print(f"Detalhe do erro: {e}")
    exit()

# --- LÓGICA DO FILTRO ---

# Listas de palavras-chave para cada tipo de verificação
GENERAL_KEYWORDS = ['mercado livre', 'ml', 'amazon', 'magalu', 'americanas']

def check_shopee_reais_off(text):
    """
    REGRA 1: Shopee, de R$20 a R$30 OFF em compras de R$60 a R$100.
    Ex: "CUPOM SHOPEE R$20 OFF em R$60"
    """
    if 'shopee' not in text:
        return False

    # Encontra todos os valores monetários no texto (ex: R$20, R$ 60)
    # A expressão r'r\$\s*(\d+)' procura por "R$", um espaço opcional, e captura o número.
    valores_reais = [int(v) for v in re.findall(r'r\$\s*(\d+)', text)]
    if len(valores_reais) < 2: # Precisa de pelo menos um valor de desconto e um de gasto
        return False

    # Verifica se existe uma combinação válida de desconto e gasto mínimo
    desconto_valido = False
    gasto_valido = False

    for valor in valores_reais:
        if 20 <= valor <= 30:
            desconto_valido = True
        if 60 <= valor <= 100:
            gasto_valido = True
    
    if desconto_valido and gasto_valido:
        print("Match [Shopee R$ OFF]: Desconto em reais e gasto mínimo válidos.")
        return True
    
    return False

def check_shopee_video_percent_off(text):
    """
    REGRA 2: Shopee Vídeo, com 20% a 25% de desconto.
    Ex: "25% OFF com Shopee Vídeo"
    """
    if 'shopee' not in text or 'vídeo' not in text:
        return False

    # Encontra todas as porcentagens
    porcentagens = [int(p) for p in re.findall(r'(\d+)%', text)]
    for p in porcentagens:
        if 20 <= p <= 25:
            print(f"Match [Shopee Vídeo %]: Desconto de {p}% válido.")
            return True
            
    return False

def check_general_percent_off(text):
    """
    REGRA 3: Lojas gerais com 20% ou mais de desconto.
    """
    if not any(keyword in text for keyword in GENERAL_KEYWORDS):
        return False
        
    porcentagens = [int(p) for p in re.findall(r'(\d+)%', text)]
    for p in porcentagens:
        if p >= 20:
            print(f"Match [Geral %]: Desconto de {p}% >= 20% encontrado.")
            return True

    return False

def cupom_interessante(texto_mensagem):
    """
    Verifica se a mensagem se encaixa em QUALQUER uma das regras de interesse.
    """
    if not texto_mensagem:
        return False
    
    texto_lower = texto_mensagem.lower()

    # Executa cada verificação em ordem. Se uma for verdadeira, já retorna True.
    if check_shopee_reais_off(texto_lower):
        return True
    
    if check_shopee_video_percent_off(texto_lower):
        return True
        
    if check_general_percent_off(texto_lower):
        return True

    # Se nenhuma regra foi atendida
    return False


# --- EXECUÇÃO DO BOT ---

client = TelegramClient('session_monitor', API_ID, API_HASH)
bot = TelegramClient('bot_session', API_ID, API_HASH).start(bot_token=BOT_TOKEN)

@client.on(events.NewMessage(chats=SOURCE_CHANNELS))
async def handler(event):
    """
    Esta função é chamada toda vez que uma nova mensagem chega nos canais monitorados.
    """
    message = event.message
    print(f"Nova mensagem recebida do canal {event.chat_id}: {message.text[:70]}...")

    if cupom_interessante(message.text):
        print("MENSAGEM INTERESSANTE! ENVIANDO NOTIFICAÇÃO...")
        try:
            await bot.send_message(
                entity=DESTINATION_CHAT_ID,
                message=message.text
            )
            print("Notificação enviada com sucesso!")
        except Exception as e:
            print(f"Erro ao enviar a notificação: {e}")

async def main():
    """Função principal para rodar o cliente."""
    print("Monitor de cupons iniciado...")
    await client.run_until_disconnected()

with client:
    client.loop.run_until_complete(main())