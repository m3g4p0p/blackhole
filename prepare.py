import argparse
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


def parse_args():
    parser = argparse.ArgumentParser()

    parser.add_argument('dirs', nargs='*', default=['src'])
    parser.add_argument('--exclude', nargs='*', default=[])
    parser.add_argument('--add-root', action='store_true')

    return parser.parse_args()


def find_files():
    args = parse_args()
    find_command = ['find', *args.dirs, '-type', 'f']

    for exclude in args.exclude:
        find_command.extend(['-not', '-name', exclude])

    files = subprocess.run(find_command, capture_output=True)

    file_list = re.sub('^src', '.', files.stdout.decode(
        'utf-8').strip(), flags=re.MULTILINE).split('\n')

    if args.add_root:
        file_list.insert(0, '.')

    return file_list


shutil.rmtree('dist', ignore_errors=True)
shutil.copytree('src', 'dist', ignore=shutil.ignore_patterns('*.js'))
file_list = find_files()

with open('package.json') as package_json:
    version = json.load(package_json)['version']

    modify('sw.js', [
        ('CACHE_NAME', dump(version)),
        ('URLS_TO_CACHE', dump(file_list))
    ])

    modify('index.html', [
        ('/* VERSION */', 'window.blackhole = ' + dump(version))
    ])
