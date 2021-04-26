import json
import re
import shutil
import subprocess


def dump(value):
    return json.dumps(value, indent=2).replace('"', "'")


files = subprocess.run(
    ['find', 'src', '-type', 'f', '-not', '-name', 'sw.js',
     '-not', '-name', '*.json'], capture_output=True)

file_list = ['.'] + re.sub('^src', '.', files.stdout.decode(
    'utf-8').strip(), flags=re.MULTILINE).split('\n')

shutil.rmtree('dist', ignore_errors=True)
shutil.copytree('src', 'dist')

with open('package.json') as package_json, \
        open('src/sw.js') as sw_src, \
        open('dist/sw.js', 'w') as sw_dist:
    version = json.load(package_json)['version']
    sw_dist.write(sw_src.read().replace(
        'CACHE_NAME',
        dump(version)
    ).replace(
        'URLS_TO_CACHE',
        dump(file_list)
    ))
