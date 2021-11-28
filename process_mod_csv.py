import matplotlib.pyplot as plt
import shapefile
import csv
import sys




def main():
    # f_in = open('../germany_pts.csv')
    # f_lines = f_in.readlines()
    # n_pts = len(f_lines)
    segments = []
    # min_x = sys.float_info.max
    # min_y = sys.float_info.max
    # max_x = sys.float_info.min
    # max_y = sys.float_info.min
    # lines = []
    shape = shapefile.Reader("../DEU_adm3.shp")
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
    f_out = open('DEU_reformat.txt','w')
    f_out.write(str(len(segments)) + '\n')
    f_out.write((str(bounds[0]) + ' ' + str(bounds[2]) + ' ' + str(bounds[1]) + ' ' + str(bounds[3])) + '\n')
    for s in segments:
        f_out.write((str(s[0][0]) + ' ' + str(s[1][0]) + ' ' + str(s[0][1]) + ' ' + str(s[1][1])) + '\n')
    f_out.close()
        
        
if __name__ == "__main__":
    main()
        