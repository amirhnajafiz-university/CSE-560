import json
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

# identify categorical and numerical columns
print("identifying categorical and numerical columns ...")
categorical = df.select_dtypes(include=['object', 'category']).columns.to_list()
numerical = df.select_dtypes(include=['int', 'float']).columns.to_list()
output_data = {'categorical': categorical, 'numerical': numerical}

# dictionary to store mappings
mappings = {}
# convert non-numeric data columns to categorical data
print("converting non-numeric data to categorical data ...")
for col in df.columns:
    if df[col].dtype == 'object' or df[col].dtype.name == 'category':
        print(f"!converting {col} to categorical data ...")
        df[col] = df[col].astype('category')
        mappings[col] = dict(enumerate(df[col].cat.categories))
        df[col] = df[col].cat.codes

# export to new dataset file
print(f"exporting {EXPORT} ...")
df.to_csv(EXPORT, index=False)

# export categorical and numerical columns to a JSON file
print("exporting categorical and numerical columns ...")
with open('data/metadata.json', 'w') as f:
    json.dump(output_data, f, indent=4)

# export mappings to a JSON file
print("exporting mappings ...")
with open('data/mappings.json', 'w') as f:
    json.dump(mappings, f, indent=4)

# print metadata like the number of rows, columns, number of mappings, number of numerical and categorical columns
print(f"\nrows: {df.shape[0]}", f"columns: {df.shape[1]}", f"mappings: {len(mappings)}")
print(f"categorical columns: {len(categorical)}", f"numerical columns: {len(numerical)}")
