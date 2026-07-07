---
title: C++运算符优先级
date: 2022-11-23 15:55:03
description: 
tags: C++语法
categories: C++
top_img: img/Bing/Aldeyjarfoss.webp
cover: https://cdn.jsdelivr.net/gh/Human6sa/blog-source@main/themes/butterfly/source/img/Bing/Aldeyjarfoss.webp
---

第一级： 

``` cpp
[] () . ->
```

第二级：

```
- (类型) ++ -- * & ! ~ sizeof
```

第三级：

```
/ * %
```

第四级：

``` 
+ -
```

第五级：

```
<< >>
```

第六级：

```
> >= < <=
```

第七级：

```
== !=
```

第八~十四级：

```
&
^
|
&&
||
?:
```



# 逻辑中断：

```
(表达式1)||(表达式2)
若表达式1为真，则不执行表达式2

(表达式1)&&(表达式2)
若表达式1为假，则不执行表达式2

```

相当于电路中的断路处理，~~可用于压行~~

 



















