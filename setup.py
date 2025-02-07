import numpy as np
import pandas as pd



DATASET = "data/laptop_prices.csv"
EXPORT = "data/500_laptop_prices.csv"

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

# change 'price euro' to 'price' and convert the values to dollars
print("converting price euro to price in dollars ...")
df['price'] = df['Price_euros'].apply(lambda x: round(x * 1.19, 2))
df.drop(columns=['Price_euros'], inplace=True)

# process column titles
print("processing column titles ...")
df.columns = df.columns.str.replace('_', ' ').str.replace(r'(?<!^)(?=[A-Z])', ' ').str.lower()

# export to new dataset file
print(f"exporting {EXPORT} ...")
df.to_csv(EXPORT, index=False)
