import matplotlib.pyplot as plt
import seaborn as sns

sns.set_style("whitegrid")

df.hist(figsize=(12, 10))
plt.tight_layout()
plt.show()

plt.figure(figsize=(8, 6))
sns.scatterplot(data=df, x='PM10', y='PM2.5')
plt.title('Scatter Plot PM2.5 vs PM10')
plt.xlabel('PM10')
plt.ylabel('PM2.5')
plt.show()

plt.figure(figsize=(8, 6))
sns.scatterplot(data=df, x='Temperature', y='PM2.5')
plt.title('Scatter Plot PM2.5 vs Temperature')
plt.xlabel('Temperature')
plt.ylabel('PM2.5')
plt.show()

plt.figure(figsize=(12, 6))
features_df = df.drop(columns=['PM2.5'])
sns.boxplot(data=features_df)
plt.title('Box Plot of Features')
plt.ylabel('Value')
plt.xticks(rotation=45, ha='right')
plt.tight_layout()
plt.show()