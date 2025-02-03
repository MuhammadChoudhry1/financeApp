from pymongo import MongoClient

secret_key = 'mysecret'

client = MongoClient("mongodb://localhost:27017/")
db = client.finance