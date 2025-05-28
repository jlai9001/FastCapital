import bcrypt

######################################################################################################## generate

password = "admin123"
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
print(f"Hash for {password}: {hashed}")


######################################################################################################### testing

unencrypted = "demo2024"
encrypted = "$2b$12$APvM26Vbbc8fvxFfrIGAKudul24SGcuA7znlfTxrUcr8rW9zk7WF2"
test = bcrypt.checkpw(unencrypted.encode(), encrypted.encode())
print(f"Verification test for {unencrypted}: {test}")



# admin123 / $2b$12$B.u84R0iEfuKtPFW2r13DOhAu6iHKm2erZD0icf8NjYCIVDW0L.RW
# demo2024 / $2b$12$APvM26Vbbc8fvxFfrIGAKudul24SGcuA7znlfTxrUcr8rW9zk7WF2
