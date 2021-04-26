import json
import re
import subprocess


def dump(value):
    return json.dumps(value, indent=2).replace('"', "'")


files = subprocess.run(['find', 'src', '-type', 'f'], capture_output=True)
file_list = ['.'] + re.sub('^src', '.', files.stdout.decode(
    'utf-8').strip(), flags=re.MULTILINE).split('\n')

with open('package.json') as package_json, \
        open('sw-template.js') as template, \
        open('src/sw.js', 'w') as sw:
    version = json.load(package_json)['version']
    sw.write(template.read().replace(
        'CACHE_NAME',
        dump(version)
    ).replace(
        'URLS_TO_CACHE',
        dump(file_list)
    ))
