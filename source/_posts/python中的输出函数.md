---
title: Python中print()函数的使用
date: 2023-09-12 20:12:51
tags: Python语法
categories: Python
top_img: img/Bing/AppalachianTrail.webp
cover: https://cdn.jsdelivr.net/gh/Human6sa/blog-source@main/themes/butterfly/source/img/Bing/AppalachianTrail.webp
---

# print()函数的使用



## print()函数可以输出哪些内容？

- 数字
- 字符串
- 含有运算符的表达式

## print()函数可以输出到哪里？

- 显示器
- 文件

## print()函数的输出形式?

- 换行
- 不换行



````python
print(520)

print("hello world")

print(2+1)

#输出到文件中
fp=open('test.txt','a+') # a+的含义是以读写的方式打开这个文件
# 同时，参数为a+时，如果文件不存在就创建，如果文件存在就在后面追加
print('helloworld',file=fp)
fp.close()

#不进行换行输出
print('I',' love ','cyo','!')
````

