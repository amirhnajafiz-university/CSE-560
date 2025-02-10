import numpy as np
import pandas as pd



# global variables
DATASET = "data/laptop_prices.csv"
EXPORT = "data/500_laptop_prices.csv"

titles = [
    "Company", "Model", "Laptop", "Screen Size", "RAM", "OS", "Weight", "Price_euros",
    "Screen", "Screen Width", "Screen Height", "Touchscreen", "IPSPanel", "Retina Display",
    "CPU Company", "CPU Frequency", "CPU Model", "Primary Storage", "Secondary Storage",
    "Primary Storage Type", "Secondary Storage Type", "GPU Company", "GPU Model"
]

# reading dataset
print(f"reading {DATASET} ...")
df = pd.read_csv(DATASET, header=0, names=titles)

# drop none data
print("dropping none ...")
df.replace('', np.nan, inplace=True)
df.dropna(inplace=True)

# drop boolean data
print("dropping boolean data ...")
df.drop(columns=['Touchscreen', 'IPSPanel', 'Retina Display', 'Secondary Storage Type'], inplace=True)

# select 500 items
print("sampling ...")
df = df.sample(n=500)

# change 'price euro' to 'price' and convert the values to dollars
print("converting price euro to price in dollars ...")
df['Price'] = df['Price_euros'].apply(lambda x: round(x * 1.19, 2))
df.drop(columns=['Price_euros'], inplace=True)

# export to new dataset file
print(f"exporting {EXPORT} ...")
df.to_csv(EXPORT, index=False)
