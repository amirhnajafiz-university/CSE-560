import numpy as np
import pandas as pd



DATASET = "datasets/laptop_prices.csv"
EXPORT = "datasets/500_laptop_prices.csv"

# reading dataset
print(f"reading {DATASET} ...")
df = pd.read_csv(DATASET)

# drop none data
print("dropping none ...")
df.replace('', np.nan, inplace=True)
df.dropna(inplace=True)

# select 500 items
print("sampling ...")
df = df.sample(n=500)

# export to new dataset file
print(f"exporting {EXPORT} ...")
df.to_csv(EXPORT, index=False)
