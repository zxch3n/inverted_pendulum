# -*- coding: utf-8 -*-
'''

@author: Rem
@contact: remch183@outlook.com
@site: 
@software: PyCharm Community Edition
@file: plot.py
@time: 2017/1/2 21:12
'''
__author__ = 'Rem'

import pandas as pd
import matplotlib.pyplot as plt
import os

if __name__ == '__main__':
    csvs = [i for i in os.listdir('./') if '.csv' in i]


    def get_rate(name):
        t = name.split('_')[-2]
        return t


    for i in range(min(9, len(csvs))):
        data = pd.read_csv(csvs[i], header=None)
        plt.subplot(3, 3, i + 1)
        plt.title('rate=' + get_rate(csvs[i]))
        plt.plot(data)
    plt.show()
