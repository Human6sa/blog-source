---
title: 【算法】常用STL函数
date: 2022-10-19 16:46:43

description: OI中常用的一些STL函数
tags: STL
categories: OI
top_img: img/22.10.19.webp
cover: img/22.10.19.webp
---

# C++标准模板库(STL)之Vector容器:

是一种顺序容器，事实上和数组差不多，但它比数组更优越。一般来说数组不能**动态**拓展，因此在程序运行的时候不是浪费内存，就是造成越界。而vector正好弥补了这个缺陷，它的特征是相当于可分配拓展的数组，它的随机访问快，在末端插入和删除快，在中间插入和删除慢。

```c++
v.push_back(t)  //在数组的最后添加一个值为t的元素
v.pop_back()  //去掉数组的最后一个数据 
v.front() 　　　//返回第一个元素
v.back()    //返回最后一个元素
v.begin()    //得到数组头的指针，用迭代器接受
v.end()     //得到数组的最后一个单元+1的指针，用迭代器接受
v.clear()    // 移除容器中所有数据
v.empty()    //判断容器是否为空吗，如果为空，则返回true 。
v.erase(pos)  //删除pos位置的数据
v.erase(beg,end)// 删除[beg,end)区间的数据
v.size()     //回容器中实际数据的个数
v.insert(pos,data) //在pos处插入数据
v[n]        //返回 v中位置为 n的元素。
v.at(n)     // 返回 v中位置为 n的元素
```



# C++标准模板库(STL)之Set容器:

关于set，必须说明的是set关联式容器。set作为一个容器也是用来存储同一数据类型的数据类型，并且能从一个数据集合中取出数据，在set中每个元素的值都唯一，而且系统能根据元素的值自动进行排序。

```c++ 
s.begin()     //返回指向第一个元素的迭代器
s.end()      //返回指向最后一个元素之后的迭代器，不是最后一个元素
s.clear()     //清除所有元素   O(n)
s.count()     //返回某个值元素的个数O(logn)
s.empty()    //如果集合为空，返回true
s.erase()     //删除集合中的元素O(logn)
s.find()      //返回一个指向被查找到元素的迭代器，如果没找到则返回end()
s.insert()     //在集合中插入元素O(logn)
s.size()     //集合中元素的数目O(1)
```



# C++标准模板库(STL)之Map映射:

Map是STL的一个关联容器，它提供一对一（其中第一个可以称为关键字，每个关键字只能在map中出现一次，第二个可能称为该关键字的值）的数据处理能力，由于这个特性，它完成有可能在我们处理一对一数据的时候，在编程上提供快速通道。

```c++ 
map<string,int> m构建了一个字符串到整数的映射。
m.begin()     //返回指向map头部的迭代器
m.clear(）     ////删除所有元素     O(n)
m.count()     //返回指定元素出现的次数O(logn)
m.empty()     //如果map为空则返回true
m.end()      //返回指向map末尾的迭代器
m.erase()     //删除一个元素
m.find()      //查找一个元素
m.insert()    // 插入元素        O(logn)
m.max_size()    //返回可以容纳的最大元素个数
m.size()      //返回map中元素的个数 O(1)
m.swap()      //交换两个map
```

# 使用auto遍历STL容器：

```
queue<int> q;
for(auto i:q) cout<<i<<' ';
```

