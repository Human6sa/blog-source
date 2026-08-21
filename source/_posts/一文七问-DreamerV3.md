---
title: 一文七问 · DreamerV3：用世界模型通吃 150+ 任务的通用强化学习
date: 2026-08-21 20:46:00
updated: 2026-08-21 20:46:00
tags:
  - 强化学习
  - 世界模型
  - DreamerV3
  - 论文解读
categories: 论文解读
description: 一文七问解读 DreamerV3——一套固定超参数、基于世界模型的通用强化学习算法，首次在不依赖人类数据的情况下从零开始，在 Minecraft 中挖到钻石。
---

## 导读

本篇推文将为大家介绍 Google DeepMind 与多伦多大学提出的一种名为 DreamerV3 的通用强化学习算法。该算法基于世界模型（World Models），先让智能体在想象中预测环境的演化，再在想象出的轨迹上训练策略。DreamerV3 旨在用一套固定的超参数解决多种不同领域的任务，而无需针对每个任务单独调参。作者在超过 150 个、跨越 8 大类的任务上验证了该算法，其中最受关注的是首次在不使用任何人类数据和课程学习的情况下，从零开始纯靠探索在《我的世界》（Minecraft）中挖到了钻石。



## 论文简介

### 标题

Mastering Diverse Domains through World Models

### 作者

Danijar Hafner<sup>1,2</sup>，Jurgis Pasukonis<sup>1</sup>，Jimmy Ba<sup>2</sup>，Timothy Lillicrap<sup>1</sup>

### 单位

<sup>1</sup> Google DeepMind；<sup>2</sup> University of Toronto

论文地址：https://arxiv.org/abs/2301.04104



## Seven Questions for a Paper

### 1.研究动机是什么？



一句话概括：把强化学习从每个任务都要人工调参的困境中解放出来，做成一个通用、开箱即用的算法。

作者观察到两个长期困扰强化学习落地的问题。其一是对超参数的极度敏感：现有算法在不同领域上，需要人类专家投入大量时间做试错式的调参，这种脆弱性既拖慢了研究迭代，也让强化学习难以应用到调参成本过高的场景。其二是算法在不同领域之间的割裂：擅长 Atari 的方法未必擅长连续控制，擅长机器人任务的方法未必擅长稀疏奖励探索，业界始终缺乏一个一法通吃的统一方案。

于是 DreamerV3 要回答的核心问题就变得很清晰：能不能固定住一整套超参数，让它不加任何改动地，在视觉任务、连续控制、稀疏奖励、3D 环境、机器人等多类任务上都保持竞争力。

***

### 2.主要解决了什么问题？



论文要解决的问题可以归纳为三点。

- 第一是跨领域泛化，用唯一一套固定超参数在 8 大类、超过 150 个任务上达到或超过各领域专门算法，全程无需任何领域级的调优。

- 第二是稀疏奖励与长程探索，在《我的世界》这类奖励极其稀疏、时间跨度极长的任务里，首次在不依赖人类演示数据、不依赖课程学习的情况下从零挖到钻石，这是此前强化学习方法从未做到的。

- 第三是数据与算力效率，在多数基准上以更少的环境交互步数取得更强性能，且全部结果都可用单张 NVIDIA A100 GPU 复现。

***

### 3.所提的方法是什么？



DreamerV3 延续了 Dreamer 系列的核心范式：先学一个世界模型，再在世界模型想象出的轨迹上训练 actor-critic，全程不与真实环境交互，这种在潜空间里做想象的学习方式被称为 latent imagination。在此框架之上，V3 通过一系列鲁棒性技巧，消除了对调参的依赖。整个训练流程如图 1 所示。

<p align="center">
  <img src="https://rlchian-bbs.oss-cn-beijing.aliyuncs.com/images/2026/08/20/09b75616aa8445ffc758feaa4d9d15f7.png" alt="训练流程示意图">
</p>
<center>图1 Dreamer 的训练流程：世界模型将感官输入编码为离散表征，并由序列模型预测其演化；actor 与 critic 在世界模型想象出的轨迹上学习</center>
<br>

具体来说，算法由三个神经网络组成。世界模型采用循环状态空间模型（Recurrent State-Space Model, RSSM），其核心组件可以写成如下形式。序列模型负责根据历史动作与状态预测下一步的确定性隐状态：

$$
h_t = f_\phi(h_{t-1}, z_{t-1}, a_{t-1})
$$

动力学预测器在隐状态之上给出下一步的随机离散表征，编码器则把真实观测融入表征：

$$
z_t \sim p_\phi(z_t \mid h_t), \qquad z_t \sim q_\phi(z_t \mid h_t, x_t)
$$

此外还有三个预测头，分别用于重建观测、预测奖励和预测回合是否结束：

$$
\hat{x}_t \sim p_\phi(x_t \mid h_t, z_t),\quad \hat{r}_t \sim p_\phi(r_t \mid h_t, z_t),\quad \hat{c}_t \sim p_\phi(c_t \mid h_t, z_t)
$$

世界模型的整体损失由表征正则项与三个重建项组成：

$$
\mathcal{L}_{\mathrm{WM}} = \mathbb{E}_{q_\phi}\left[\sum_t \mathrm{KL}\big[q_\phi(z_t\mid h_t,x_t)\,\|\,p_\phi(z_t\mid h_t)\big] - \ln p_\phi(x_t\mid h_t,z_t) - \ln p_\phi(r_t\mid h_t,z_t) - \ln p_\phi(c_t\mid h_t,z_t)\right]
$$

在世界模型之上，actor 以最大化想象回报为目标选择动作，并带熵正则；critic 则预测回报分布。为让这一整套组件在不同任务上稳定工作，作者引入了若干关键技巧。

其一是 symlog 变换。不同任务的观测与回报在量级上可以相差数十个数量级，直接用均方误差回归极易失稳。作者采用双向对称的对数变换来统一处理预测目标：

$$
\mathrm{symlog}(x) = \operatorname{sign}(x)\ln(|x|+1), \qquad \mathrm{symexp}(x) = \operatorname{sign}(x)(e^{|x|}-1)
$$

与之配套，critic 和奖励预测器不再预测单一标量，而是预测一个定义在指数间隔分箱上的类别分布（symexp twohot）。设分箱为 $B_i=\mathrm{symexp}\!\big(\mathrm{symlog}(v_{\min})+i\,\Delta\big)$，则回报与价值可被稳定地表示在从小到大的整个动态范围内，从而适应奖励尺度的巨大差异。

其二是百分位回报归一化。作者用回报分布的 5% 到 95% 百分位做归一化，并对分母设下限 $L=1$，从而让奖励尺度差异不再影响训练。其三是 KL balance 与 free bits：把表征正则项拆成动力学与表征两部分，分别赋权重 $\beta_{\mathrm{dyn}}$ 与 $\beta_{\mathrm{rep}}$，并对 KL 做 1 nat 的截断，缓解了不同视觉复杂度下表征正则长期存在的问题。此外还有对类别分布做 1% 的 unimix 混合以防止分布塌缩、自适应梯度裁剪、LaProp 优化器、块对角 GRU 等一系列工程化技巧，它们共同保证了固定超参数下训练的稳定性。

***

### 4.关键结果及结论是什么？


论文最受关注的成果，是在《我的世界》中挖到钻石。这是一个难度很高、被广泛关注的任务：奖励极度稀疏、探索空间巨大、时间跨度极长，且存在大量的程序化生成内容。此前的方法（如基于视频预训练的 VPT）都需要依赖大量人类演示数据，并使用 720 张 GPU 训练约 9 天。而 DreamerV3 在不使用任何人类数据和课程学习的情况下，从零开始纯靠探索，在 1 亿环境步内首次收集到钻石，10 个随机种子中有 10 个全部成功，整个过程只用了 1 张 GPU。图 2 展示了随着训练进行，能发现各项物品的智能体比例。

<p align="center">
  <img src="https://rlchian-bbs.oss-cn-beijing.aliyuncs.com/images/2026/08/20/c9e9794ca70cf0e8d4f0574182c8ab33.png" alt="Minecraft 挖钻石结果">
</p>
<center>图2 Minecraft 中能够发现各阶段物品（含钻石）的智能体比例随环境步数的变化</center>
<br>

更具一般性的结论体现在跨基准的表现上。论文在视觉控制（Control Suite）、Atari、ProcGen、DMLab、Minecraft、Atari100k、本体感知控制、BSuite 等多个领域进行了评测，全部使用同一套固定超参数，结果如图 3 所示。在 Atari 的 57 个游戏上，DreamerV3 超越了 MuZero、Rainbow 和 IQN；在 ProcGen 的 16 个游戏上匹敌 PPG 并超越 Rainbow；在 DMLab 的 30 个任务上超过了 IMPALA 和 R2D2+，而后两者使用了 10 倍的数据量；在数据高效的 Atari100k 上超越了 IRIS、TWM、SPR 和 SimPLe，仅略逊于使用关卡重置技巧的 EfficientZero；在本体感知控制的 18 个任务和视觉控制的 20 个任务上，分别刷新了当时的最高水平，超越 D4PG、DMPO、MPO、DrQ-v2 和 CURL。

<p align="center">
  <img src="https://rlchian-bbs.oss-cn-beijing.aliyuncs.com/images/2026/08/20/2209c93032451501957a2d1aab5c870c.png" alt="跨基准对比结果">
</p>
<center>图3 DreamerV3 在多个领域基准上的归一化得分汇总，全部使用同一套固定超参数</center>
<br>

此外，论文还系统研究了扩展性。将模型从 1200 万参数逐步扩到 4 亿参数，作者发现更大的模型不仅性能更强，所需的数据反而更少；提高 replay ratio 也能稳定地带来性能提升。这说明 DreamerV3 具备良好的扩展律，为把强化学习当作基础模型来训练提供了实证支撑，相关消融与扩展实验如图 4 所示。


<p align="center">
  <img src="https://rlchian-bbs.oss-cn-beijing.aliyuncs.com/images/2026/08/20/067749fcd871327d9cc9d73b0bd36340.png" alt="消融与扩展性实验">
</p>
<center>图4 鲁棒性技巧的消融实验，以及模型规模、replay ratio 对性能的影响</center>
<br>

综合来看，论文的核心结论可以概括为：一个固定超参数的通用算法，可以在极多样化的任务上同时取得最先进水平，并具备可预测的扩展性。

***

### 5.创新点在哪里？



本文的创新更多体现在如何让一套固定超参数真正跑通，也就是那些让训练在跨领域下保持稳定的技术细节。这些贡献可以拆成几个层次来看。

其一，symlog 与 symexp twohot 用双向对称对数变换加上指数间隔分箱来预测奖励与价值，解决了不同任务目标量级差异巨大、直接回归极易失稳的问题。

其二，百分位回报归一化让奖励的绝对尺度不再进入优化目标，这是算法能够不加改动地跨任务迁移的关键。

其三，KL balance、free bits 与 1% unimix 针对的是世界模型中表征正则的难题，让模型在视觉复杂度差异悬殊的场景下都能学到稳定的表征。

此外，块对角 GRU、自适应梯度裁剪、LaProp 优化器等工程技巧进一步保证了大规模、长程训练下的稳定性。把这些各自独立的小改进组合起来，才最终呈现出前面所述的跨领域泛化效果。

***

### 6.有值得阅读的相关文献吗？



1. Hafner 等人提出了 PlaNet，用潜动力学模型做规划，奠定了世界模型强化学习的基本范式。[Learning Latent Dynamics for Planning from Pixels, ICML 2019](https://arxiv.org/abs/1811.04551)

2. 同一团队的 Dreamer 首次把世界模型与 actor-critic 结合，在连续控制上取得最先进水平。[Dream to Control: Learning Behaviors by Latent Imagination, arXiv 2019](https://arxiv.org/abs/1912.01603)

3. DreamerV2 引入离散表征与 KL balance，首次在 Atari 上超越人类水平，是本文的直接前作。[Mastering Atari with Discrete World Models, arXiv 2020](https://arxiv.org/abs/2010.02193)

4. MuZero 代表了另一条基于模型的路线，用价值等价的隐式模型做蒙特卡洛树搜索，可作为对照阅读。[Mastering Atari, Go, Chess and Shogi by Planning with a Learned Model, Nature 2020](https://arxiv.org/abs/1911.08265)

5. EfficientZero 是 MuZero 的数据高效版本，在 Atari100k 上保持最先进，本文也认可其在 Atari100k 上的表现。[Mastering Atari Games with Limited Data, NeurIPS 2021](https://arxiv.org/abs/2111.00210)

6. VPT 用人类视频预训练再微调来玩 Minecraft，与本文从零学习形成鲜明对比。[Video PreTraining (VPT): Learning to Act by Watching Unlabeled Online Videos, NeurIPS 2022](https://arxiv.org/abs/2206.11795)

***

### 7.综合评价如何？


DreamerV3 是基于模型的强化学习领域一项有代表性的工作。它的价值不在于某一个基准的数字，而在于证明了固定超参数的通用强化学习算法是可行的。较好的通用性与可复现性（一套超参数跨 150 多个任务、代码开源、单卡可复现）、清晰的扩展律，以及一批可迁移到其他工作的鲁棒性技巧，使其对研究社区具有较高的参考价值。

当然，它也有不足：算力成本仍然不低，Minecraft 挖钻石仍需单卡训练约 9 天；部分基准的 baseline 使用了 10 倍数据优势，且未与 Gato、Voyager 等需要外部数据或 API 的方法直接对比；此外工作仍以单任务学习为主，离真正的通用智能体还有距离，在算力利用上也不一定是 compute-optimal。

总体而言，它在把强化学习从依赖人工调参推向更通用、可扩展方向上做出了有益的尝试。

***

## 作者简介


胡兆杨，自动化所2026级研究生，研究兴趣包括强化学习、具身智能与 Sim2Real 等。

联系邮箱：huzhaoyang2026@ia.ac.cn



## 联系我们


欢迎关注 RLCN 公众号，获取 RL 相关资讯。

Email: rlchinacamp@163.com

![Description](https://jidi-images.oss-cn-beijing.aliyuncs.com/rlchina2021/rlcn.jpeg?x-oss-process=image%2Fresize%2Cl_200)
