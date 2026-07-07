---
title: C++中的::运算符
date: 2022-12-08 21:11:51
description: 
tags: C++语法
categories: C++
top_img: img/Bing/AlfanzinaLighthouse.webp
cover: https://cdn.jsdelivr.net/gh/Human6sa/blog-source@main/themes/butterfly/source/img/Bing/AlfanzinaLighthouse.webp
---

$::$ 是运算符中优先级最高的，其用法有三种：

一、全局作用域符

当全局变量和局部变量重名的时候，在变量名前加上 $::$ 就可以调用全局变量

全局函数也是如此

```cpp
用法 (::name)

int sum;

int Add(int x){
    int sum=x;
    ::sum+=sum;
}
```

二、类作用域符

用来标明类的变量、函数

```cpp
用法 (class::name)

Clock::SetTime(int h,int m,int s);
```

三、命名空间作用域符

用来注明所使用的类、函数属于哪一个命名空间的

```cpp
用法 (namespace::name)

std::cout << "Hello World" << std::endl;
```

