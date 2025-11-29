import requests
import sys
fpath = r'c:\Users\pc\OneDrive\Desktop\my website\scripts\test-cv.txt'
url = 'http://127.0.0.1:8000/api/contact/'
try:
    with open(fpath, 'rb') as f:
        files = {'cv': (fpath.split('\\')[-1], f)}
        data = {'name':'CI Test','email':'ci@example.com','message':'Upload test'}
        r = requests.post(url, data=data, files=files, timeout=10)
        print('STATUS', r.status_code)
        try:
            print(r.json())
        except Exception:
            print(r.text)
except Exception as e:
    print('ERROR', e)
    sys.exit(1)
