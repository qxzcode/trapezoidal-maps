import matplotlib.pyplot as plt
import shapefile
import argparse
import csv
import sys

# uses https://pypi.org/project/pyshp/

def main(args):
    # f_in = open('../germany_pts.csv')
    # f_lines = f_in.readlines()
    # n_pts = len(f_lines)
    segments = []
    # min_x = sys.float_info.max
    # min_y = sys.float_info.max
    # max_x = sys.float_info.min
    # max_y = sys.float_info.min
    # lines = []
    shape = shapefile.Reader(args.filename)
    bounds = shape.bbox
    #first feature of the shapefile
    features = shape.shapeRecords()
    for feature in features:
        first = feature.shape.__geo_interface__ 
        pts = first['coordinates'][0]
        for p in range(len(pts)-1):
            segment = (pts[p],pts[p+1])
            segments.append(segment)
        
    # for s in segments:
    #     plt.plot([s[0][0], s[1][0]],[s[0][1], s[1][1]])
    # #plt.scatter(xs, ys)
    # plt.show()
    
    #write it to file
    f_out = open(args.o,'w')
    f_out.write(str(len(segments)) + '\n')
    f_out.write((str(bounds[0]) + ' ' + str(bounds[1]) + ' ' + str(bounds[2]) + ' ' + str(bounds[3])) + '\n')
    for s in segments:
        f_out.write((str(s[0][0]) + ' ' + str(s[0][1]) + ' ' + str(s[1][0]) + ' ' + str(s[1][1])) + '\n')
    f_out.close()
        
        
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert a shapefile to CSCI 716 trapezoid input data file")
    parser.add_argument('filename', metavar='f_in', type=str, help='The input file')
    parser.add_argument('-o', metavar='f_out', default='mapOut.txt',type=str, help="Filename for output.")
    
    args = parser.parse_args()
    print(args)
    
    main(args)
        