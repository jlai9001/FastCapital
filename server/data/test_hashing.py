import bcrypt

password = "admin123"
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
print(f"Hash for 'admin123': {hashed}")

# Test it works
test = bcrypt.checkpw(password.encode(), hashed.encode())
print(f"Verification test: {test}")
