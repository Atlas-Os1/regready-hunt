import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
pack = json.loads((ROOT / 'data/oklahoma/source-pack.json').read_text(encoding='utf-8'))
out = ROOT / 'data/oklahoma/seed.sql'

def q(value):
    if value is None:
        return 'NULL'
    return "'" + str(value).replace("'", "''") + "'"

lines = [
    'INSERT OR REPLACE INTO source_packs (pack_id, authority, retrieved_at, status, legal_notice) VALUES ('
    + ','.join(q(v) for v in [pack['packId'], pack['authority'], pack['retrievedAt'], pack['status'], pack['legalNotice']]) + ');'
]
for source in pack['sources']:
    lines.append(
        'INSERT OR REPLACE INTO source_documents '
        '(source_id, pack_id, species, kind, scope, source_url, final_url, retrieved_at, raw_file, text_file, bytes) VALUES ('
        + ','.join(q(v) for v in [source['id'], pack['packId'], source.get('species'), source['kind'], source['scope'], source['url'], source['finalUrl'], source['retrievedAt'], source['rawFile'], source['textFile'], source['bytes']])
        + ');'
    )
    seasons = source.get('seasons', [])
    if not seasons and source.get('species') == 'mountain lion':
        seasons = [{'title': 'No hunting season reported in captured page', 'start': None, 'end': None, 'sourceText': 'The captured Oklahoma Department of Wildlife Conservation page states that there is no hunting season for mountain lion.'}]
    for index, season in enumerate(seasons):
        rule_id = f"{source['id']}:{index + 1}"
        year = None
        for candidate in [season.get('start'), season.get('end')]:
            if candidate and any(str(y) in candidate for y in range(2020, 2031)):
                year = next(y for y in range(2020, 2031) if str(y) in candidate)
                break
        lines.append(
            'INSERT OR REPLACE INTO rule_records '
            '(rule_id, source_id, species, title, start_date, end_date, source_text, review_status, effective_year, created_at) VALUES ('
            + ','.join(q(v) for v in [rule_id, source['id'], source.get('species') or 'general', season['title'], season.get('start'), season.get('end'), season.get('sourceText', ''), 'captured-unreviewed', year, pack['retrievedAt']])
            + ');'
        )
out.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(json.dumps({'output': str(out), 'statements': len(lines)}))
