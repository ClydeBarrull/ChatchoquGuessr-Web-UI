import discord # YOU NEED TO USE SELFBOT-DISCORD.PY FORK !!!!
import csv
import datetime as dt

auteurs = []
messages = []

channelId = --- # PUT CHANEL ID HERE
userToken = --- # PUT USER TOKEN HERE

class MyClient(discord.Client):
    async def on_ready(self):
        counter = 0
        async for message in self.get_channel(channelId).history(limit=None):
            if (message.content != "") :
                print(f"{message.author} : {message.content}")
                auteurs.append(str(message.author).replace("#0",""))
                messages.append(str(message.content))

        with open(f'quotes.csv', "w", encoding='utf-32') as f:
            writer = csv.writer(f)
            writer.writerows(zip(auteurs,messages))

client = MyClient()
client.run(userToken)

