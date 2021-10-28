from pathlib import Path

output_path = Path('js/input_files.js')
with output_path.open('w') as outfile:
    outfile.write('const INPUT_FILES = {\n')
    for txt_file in sorted(Path('InputFiles').glob('*.txt')):
        outfile.write(f'    "{txt_file.stem}": [\n')
        # read the lines in the file
        with txt_file.open() as f:
            num_segs = int(f.readline())
            for line in f:
                if line.strip() != '':
                    x1, y1, x2, y2 = [int(x) for x in line.split()]
                    outfile.write(f'        new Edge(new Point({x1}, {y1}), new Point({x2}, {y2})),\n')
        outfile.write(f'    ],\n')
    outfile.write('};\n')

print(f'Wrote {output_path}')
