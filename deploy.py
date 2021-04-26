import functools
import json
import re
import shutil
import subprocess


def dump(value):
    return json.dumps(value, indent=2).replace('"', "'")


def replace(data, replacement):
    return data.replace(*replacement)


def modify(filename, replacements):
    with open('src/' + filename) as src, \
            open('dist/' + filename, 'w') as dest:
        dest.write(functools.reduce(
            replace,
            replacements,
            src.read()
        ))


find_command = ['find', 'src', '-type', 'f']

for exclude in ['sw.js', '*.json']:
    find_command.extend(['-not', '-name', exclude])

files = subprocess.run(find_command, capture_output=True)

file_list = ['.'] + re.sub('^src', '.', files.stdout.decode(
    'utf-8').strip(), flags=re.MULTILINE).split('\n')

shutil.rmtree('dist', ignore_errors=True)
shutil.copytree('src', 'dist')

with open('package.json') as package_json:
    version = json.load(package_json)['version']

    modify('sw.js', [
        ('CACHE_NAME', dump(version)),
        ('URLS_TO_CACHE', dump(file_list))
    ])

    modify('index.html', [
        ('/* VERSION */', 'window.blackhole = ' + dump(version))
    ])
