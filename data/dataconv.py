import os
import pandas as pd
import datetime as dt
import codecs

def ExcelToJSObjects(xname):
	vname = ''.join(os.path.splitext(xname)[0:-1])
	h = '//Autogen by ' + os.path.basename(__file__) + ' on ' + str(dt.datetime.now()) + '\n'
	jname = vname + '.js'
	f = codecs.open(jname, "w", encoding = 'utf-8')
	output = h + 'var ' + vname + ' = {\n'
	c = 1
	df = pd.read_excel(xname)
	for i, row in df.iterrows():
		c = c + 1
		es = '\t[' + str(c) + '] : ' + '{\n'
		for name, attr in row.items():
			if not pd.isna(attr):
				if type(name) == int or type(name) == float:
					name = str(name)
				else:
					name = '"' + name + '"'
				if type(attr) == int or type(attr) == float:
					attr = str(attr)
				else:
					attr = '"' + attr + '"'
				es =  es + '\t\t' + name + " : " + attr + ",\n"
		es = es + '\t},\n'
		output = output + es
	output = output + '}'
	print(output)
	f.write(output)

files = [f for f in os.listdir('.') if os.path.isfile(f)]
for f in files:
	e = os.path.splitext(f)[-1]
	if f[:2] != '~$' and e == '.xls':
		ExcelToJSObjects(f)
		print("Converted file: " + f)
