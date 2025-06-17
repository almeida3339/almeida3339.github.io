import os
import re
from dotenv import load_dotenv
from telethon.sync import TelegramClient, events

load_dotenv()

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

GENERAL_KEYWORDS = ['mercado livre', 'ml', 'amazon', 'magalu', 'americanas']

def check_shopee_reais_off(text):
    if 'shopee' not in text:
        return False
    valores_reais = [int(v) for v in re.findall(r'r\$\s*(\d+)', text)]
    if len(valores_reais) < 2:
        return False
    desconto_valido = any(20 <= v <= 30 for v in valores_reais)
    gasto_valido = any(60 <= v <= 100 for v in valores_reais)
    return desconto_valido and gasto_valido

def check_shopee_video_percent_off(text):
    if 'shopee' not in text or 'vídeo' not in text:
        return False
    porcentagens = [int(p) for p in re.findall(r'(\d+)%', text)]
    return any(20 <= p <= 25 for p in porcentagens)

def check_general_percent_off(text):
    if not any(keyword in text for keyword in GENERAL_KEYWORDS):
        return False
    porcentagens = [int(p) for p in re.findall(r'(\d+)%', text)]
    return any(p >= 20 for p in porcentagens)

def cupom_interessante(texto_mensagem):
    if not texto_mensagem:
        return False
    texto_lower = texto_mensagem.lower()
    return (
        check_shopee_reais_off(texto_lower)
        or check_shopee_video_percent_off(texto_lower)
        or check_general_percent_off(texto_lower)
    )

client = TelegramClient('session_monitor', API_ID, API_HASH)
bot = TelegramClient('bot_session', API_ID, API_HASH).start(bot_token=BOT_TOKEN)

@client.on(events.NewMessage(chats=SOURCE_CHANNELS))
async def handler(event):
    message = event.message
    if cupom_interessante(message.text):
        try:
            await bot.send_message(
                entity=DESTINATION_CHAT_ID,
                message=message.text
            )
        except Exception as e:
            print(f"Erro ao enviar a notificação: {e}")

async def main():
    await client.run_until_disconnected()

with client:
    client.loop.run_until_complete(main())
