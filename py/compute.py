import json
import csv

with open("res/olympicAthletes.csv") as f:
    reader = csv.DictReader(f)
    data = [row for row in reader]

medals = {}
for row in data:
    country = row["Country"]
    year = row["Year"]
    medals_total = int(row["Total Medals"])

    # Skip everything but 2012
    if year != "2012":
        continue

    # Group by country
    if country not in medals:
        medals[country] = 0
    medals[country] += medals_total


# Flatten dictionary to array for d3.js
medals_array = []
for country, ct in medals.items():
    medals_array.append({
        "country": country,
        "medals": ct
    })


with open('res/medals.json', 'w') as f:
    json.dump(medals_array, f, indent=2)
