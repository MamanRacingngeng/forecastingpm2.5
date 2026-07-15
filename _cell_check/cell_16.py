groups = [0, 1, 2, 3, 4, 5, 6, 7, 8]
i = 1
pyplot.figure()
for group in groups:
    pyplot.subplot(len(groups), 1, i)
    pyplot.hist(values[:, group])
    pyplot.title(str(df.columns[group]))
    i += 1
pyplot.show()