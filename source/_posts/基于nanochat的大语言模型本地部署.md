---
title: 基于nanochat的大语言模型本地部署
date: 2025-05-26 10:03:10
description:
tags:
categories:
top_img: img/Bing/AnzaBorregoBloom.webp
cover: https://cdn.jsdelivr.net/gh/Human6sa/blog-source@main/themes/butterfly/source/img/Bing/AnzaBorregoBloom.webp
---

# 一、环境配置

windows下，使用 `conda` 新建虚拟环境，使用 `pip` 进行管理

```bash
conda create -n code python=3.10
# For CUDA (Linux/Windows)
pip install torch
pip install nanochat

pip3 install torch torchvision --index-url https://download.pytorch.org/whl/cu130
pip install tokenizers datasets huggingface_hub tiktoken wandb tqdm numpy


git clone https://github.com/karpathy/rustbpe.git

# 编译安装 rustbpe
git clone https://github.com/karpathy/rustbpe.git rustbpe
maturin develop --release --manifest-path rustbpe/Cargo.toml
```


# 二、预训练

```bash
wandb login


# 下载少量数据（只下载 8 个 shards，足够 tokenizer 用）
python -m nanochat.dataset -n 8
python -m scripts.tok_train --max-chars 200000000 --vocab-size 32768 --doc-cap 2000

python -m scripts.base_train --depth=8 --target-param-data-ratio=5 --device-batch-size=2 --run=my_small_pretrain --model-tag=small_d8 --core-metric-every=999999 --sample-every=-1 --save-every=200 --window-pattern L --eval-every -1


```



# 三、中期训练


```bash
# --nproc_per_node 表示训练时所使用的GPU数量，提高GPU的数量能够加快训练速度
torchrun --standalone --nproc_per_node=1 -m scripts.mid_train -- \
    --device_batch_size=8 \
    --run=dummy
```


# 四、监督微调

  

```bash
export OMP_NUM_THREADS=1  # 设置 OpenMP 线程数为 1，避免多线程冲突

export NANOCHAT_BASE_DIR="$HOME/.cache/nanochat"  # 设置 NanoChat 缓存目录

export HF_ENDPOINT=https://hf-mirror.com  # 设置 Hugging Face 镜像端点

mkdir -p $NANOCHAT_BASE_DIR  # 创建缓存目录

```

```bash
python -m scripts.chat_sft --run=$WANDB_RUN

```


# 五、本地部署

```bash
# --num-gpus 表示推理时所使用的GPU数量
# --source sft 表示加载后训练阶段的模型
# 可选值: sft | mid | rl (如有)
python -m scripts.chat_web --num-gpus 1 --source sft
```







