---
title: C++指针与引用
date: 2022-11-23 17:21:09
description: 学OI的时候觉得指针很复杂，到了大学才发现它有大用处
tags: C++语法
categories: C++
top_img: img/bing/AncientOrkney.webp
cover: img/bing/AncientOrkney.webp
---

# 内存地址与访问方式

内存地址：系统根据程序中定义变量的类型，给变量分配一定的长度空间。内存区的每个字节都有编号，称之为地址。

在 $C++$ 中，内存分成5个区：堆、栈、自由存储区、全局/静态存储区和常量存储区。

1. 栈：由编译器自动分配释放，里面的变量通常是局部变量、函数参数等。

2. 堆：由 `malloc` 等分配的内存块，用 `free` 来释放。

3. 自由存储区：主要是由 `new​` 分配的内存块，释放由应用程序去控制，一般一个 $new$ 就要对应一个 $delete$ 。如果程序员没有释放掉，那么在程序结束后，操作系统会自动回收。

4. 全局/静态存储区：全局变量和静态变量被分配到同一块内存中，在程序启动时分配了它们的存储，但在程序开始执行之前可能不会初始化。

5. 常量存储区：里面存放的是常量，不允许修改（当然，你要通过非正当手段也可以修改）。此区域中不能存在类类型的对象。



> Free Store
> The free store is one of the two dynamic memory areas, allocated/freed by new/delete. Object lifetime can be less than the time the storage is allocated; that is, free store objects can have memory allocated without being immediately initialized, and can be destroyed without the memory being immediately deallocated. During the period when the storage is allocated but outside the object's lifetime, the storage may be accessed and manipulated through a void* but none of the proto-object's nonstatic members or member functions may be accessed, have their addresses taken, or be otherwise manipulated.
>
> Heap
> The heap is the other dynamic memory area, allocated/freed by malloc/free and their variants. Note that while the default global new and delete might be implemented in terms of malloc and free by a particular compiler, the heap is not the same as free store and memory allocated in one area cannot be safely deallocated in the other. Memory allocated from the heap can be used for objects of class type by placement-new construction and explicit destruction. If so used, the notes about free store object lifetime apply similarly here.

来源：http://www.gotw.ca/gotw/009.htm



# 指针

指针变量：用于专门存放地址的变量。

## 定义方式：

```
类型表示符 *指针变量名;
```

## 赋值

&用来取变量的地址

```cpp
p=&i;
int *p=&i;
```

*用来取指针指向地址的内容（解地址）

```cpp
int *p,a[10];
p=a;
p=&a[0];
```

注：

1. void* 类型的指针可以指向任意类型的变量

2. 指针在初始化时一般 int *p=NULL;

## 数组指针

存放一维或多维数组首地址的指针

```cpp
int a[3][4];
a[0][0]=1,a[1][0]=2;
int (*p)[4]=a;
//p是一个指针，它指向包含4个元素的一维数组
cout<<*p[0]<<endl;
p++;//指向下一行的首地址
cout<<*p[0]<<endl;
```

## 指针与二维数组
```cpp
a代表二维数组的首地址，第0行的地址
a+i代表第i行的地址
*(a+i)即a[i] 代表第i行第0列的地址
*(a+i)+j即a[i]+j 代表第i行第例的地址
*(*(a+i)+j)即a[i][j] 代表第i行第j列的元素
```

## 函数指针

指向函数的指针变量

```cpp
返回值类型 (* 指针变量名)(形参列表);
```

例如：

```cpp
bool max(int x,int y){return x<y;}
int main(){
    bool (*cmp)(int,int);
    cmp=max;
    cout<<cmp(1,2);
}
```

可作为某个函数的参数

```cpp
sort(Stu a[],int n,bool (*cmp)(const Stu &a,const Stu &b))
```

## 作为函数值的返回类型

可用于**给函数返回值赋值**

```cpp
int value[] = {0, 1, 2, 3};

int *GetPointerValue(int i) {return &value[i];}

int *GetPointersValue() {
    int *r=new int[4];
    for(int i=0;i<4;i++) r[i]=value[i];
    return r;
}

int main() {
    cout<<value[0]<<endl;
    *GetPointerValue(0)=-1;
    cout<<value[0]<<endl;
    int *r=GetPointersValue();
    cout<<r[0]<<" "<<r[1]<<" "<<r[2]<<endl;
}

```



# 引用

引用：给已有的变量取一个别名。

可理解为“名字”

```cpp
int n=100;
int &cnt=n;
```

&不是取地址，只是描述别名。编译器不会为 $cnt$ 开辟新的空间。

引用必须初始化，且初始化后不能更改。

## 作为函数参数

```cpp
void Swap(int &a1, int &b1){
    int tmp=a1;
    a1=b1;
    b1=tmp;
}
int main(){
    int a=10,b=20;
    cout<<"a = "<<a<<", b = "<<b<<endl;
    Swap(a,b);
    cout<<"a = "<<a<<", b = "<<b<<endl;
    return 0;
}
```

好处：

1. 函数内部直接通过引用来操作外部变量的值；

2. 省去了指针的操作；

3. 函数的形参不会拥有新的空间（节约了空间）。

## 常引用

```cpp
const int &a=90;
cout<<"a = "<<a<<endl;
```

## 作为函数值的返回类型

返回类的引用可以作为左值，并且返回的类类型引用可以直接调用成员函数来修改，返回的类类型不会调用复制构造函数。

可用于**给函数返回值赋值**

```cpp
char &get_val(string &str, string::size_type ix){
       return str[ix];
}
 
int main(){
       string s("a value");
       cout << s << endl;
 
       get_val(s, 0) = 'A';
       cout << s << endl;
 
       return 0;
}
```





# 动态分配内存函数簇

## malloc

功能：在堆区开辟指定长度的空间，并且是连续的

```cpp
char *str=(char *)malloc(100*sizeof(char));
```

注：

1. 在调用 $malloc$ 之后，需要判断申请是否成功

   失败返回 $NULL$ ，成功返回开辟好的空间的首地址

2. 多次 $malloc$ ，申请的内存不一定是连续的

3. 函数返回值类型为void *，需要强制类型转换

## calloc

功能：在堆区申请指定大小的空间

```cpp
char *p=(char *)calloc(3,100);//在内存中申请了三块，每块大小为100个字节
```

注：

$calloc$ 申请的内存中的内容为0，而 $malloc$ 中的内容随机

## realloc

功能：在原本申请好的堆区空间的基础上重新申请内存，新开辟的空间大小为函数的第二个参数

如果原本申请好的空间的后面不足以增加指定的大小，系统会重新找一个足够大的位置开辟指定的空间，然后将原本空间中的数据拷贝过来，然后释放原本的空间

如果 $newsize$ 比原先的内存小，则会释放原先内存的后面的存储空间只留前面的 $newsize$ 个字节

```cpp
char *p;
p=(char *)malloc(100);
p=(char *)realloc(p,150);
p=(char *)realloc(p,50);
```

## free

功能：释放堆区的空间

```cpp
free(p);
p=NULL;
```

注：

1.  $free$ 函数只能释放堆区的空间
2. 当 $free$ 后，$p$ 变成野指针了，要 $p=NULL$
3. 一块动态申请的内存只能 $free$ 一次，不能多次 $free$ 
