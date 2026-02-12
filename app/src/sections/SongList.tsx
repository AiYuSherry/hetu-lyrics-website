import { useState, useMemo, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Calendar, Disc, ChevronRight, Search, User, Music } from 'lucide-react';
import type { Song, ViewMode } from '@/types';

// 多音字特殊处理规则
const pinyinRules: Record<string, string> = {
  "长安李白": "C",
  "朝歌": "C",
  "紫衣重": "Z",
  "还影": "H",
};

// 获取首字母
function getFirstLetter(song: Song): string {
  if (song.initial) return song.initial;
  const firstChar = song.name.charAt(0);
  if (/[A-Za-z0-9]/.test(firstChar)) return '#';
  if (song.name in pinyinRules) return pinyinRules[song.name];
  const pinyinMap: Record<string, string> = {
    '阿': 'A', '埃': 'A', '艾': 'A', '爱': 'A', '安': 'A', '岸': 'A', '暗': 'A', '昂': 'A', '奥': 'A',
    '八': 'B', '巴': 'B', '白': 'B', '百': 'B', '柏': 'B', '败': 'B', '拜': 'B', '班': 'B', '半': 'B', '邦': 'B', '帮': 'B', '宝': 'B', '保': 'B', '报': 'B', '暴': 'B', '北': 'B', '贝': 'B', '备': 'B', '被': 'B', '本': 'B', '比': 'B', '笔': 'B', '必': 'B', '毕': 'B', '闭': 'B', '碧': 'B', '避': 'B', '边': 'B', '编': 'B', '变': 'B', '便': 'B', '遍': 'B', '标': 'B', '表': 'B', '别': 'B', '冰': 'B', '兵': 'B', '丙': 'B', '病': 'B', '波': 'B', '博': 'B', '伯': 'B', '不': 'B', '布': 'B', '步': 'B', '部': 'B',
    '才': 'C', '材': 'C', '财': 'C', '采': 'C', '彩': 'C', '菜': 'C', '参': 'C', '残': 'C', '惨': 'C', '灿': 'C', '苍': 'C', '藏': 'C', '操': 'C', '草': 'C', '册': 'C', '侧': 'C', '测': 'C', '层': 'C', '插': 'C', '茶': 'C', '查': 'C', '差': 'C', '拆': 'C', '柴': 'C', '缠': 'C', '产': 'C', '尝': 'C', '常': 'C', '长': 'C', '厂': 'C', '场': 'C', '唱': 'C', '超': 'C', '潮': 'C', '车': 'C', '彻': 'C', '沉': 'C', '陈': 'C', '晨': 'C', '称': 'C', '城': 'C', '成': 'C', '承': 'C', '诚': 'C', '吃': 'C', '池': 'C', '迟': 'C', '持': 'C', '尺': 'C', '赤': 'C', '充': 'C', '冲': 'C', '虫': 'C', '崇': 'C', '抽': 'C', '愁': 'C', '仇': 'C', '丑': 'C', '初': 'C', '出': 'C', '除': 'C', '楚': 'C', '处': 'C', '穿': 'C', '传': 'C', '船': 'C', '窗': 'C', '床': 'C', '创': 'C', '吹': 'C', '垂': 'C', '春': 'C', '纯': 'C', '词': 'C', '此': 'C', '次': 'C', '刺': 'C', '从': 'C', '匆': 'C', '葱': 'C', '聪': 'C', '丛': 'C', '粗': 'C', '促': 'C', '催': 'C', '存': 'C', '寸': 'C', '错': 'C',
    '达': 'D', '答': 'D', '打': 'D', '大': 'D', '呆': 'D', '代': 'D', '带': 'D', '待': 'D', '怠': 'D', '单': 'D', '但': 'D', '淡': 'D', '蛋': 'D', '当': 'D', '党': 'D', '刀': 'D', '导': 'D', '到': 'D', '道': 'D', '得': 'D', '德': 'D', '的': 'D', '灯': 'D', '登': 'D', '等': 'D', '邓': 'D', '低': 'D', '底': 'D', '地': 'D', '弟': 'D', '第': 'D', '点': 'D', '电': 'D', '店': 'D', '掉': 'D', '爹': 'D', '叠': 'D', '丁': 'D', '顶': 'D', '定': 'D', '丢': 'D', '东': 'D', '冬': 'D', '懂': 'D', '动': 'D', '冻': 'D', '洞': 'D', '都': 'D', '斗': 'D', '豆': 'D', '独': 'D', '读': 'D', '堵': 'D', '杜': 'D', '度': 'D', '渡': 'D', '短': 'D', '段': 'D', '断': 'D', '对': 'D', '队': 'D', '吨': 'D', '蹲': 'D', '多': 'D', '夺': 'D', '朵': 'D', '躲': 'D',
    '俄': 'E', '额': 'E', '恶': 'E', '饿': 'E', '恩': 'E', '而': 'E', '儿': 'E', '耳': 'E', '二': 'E',
    '发': 'F', '罚': 'F', '法': 'F', '帆': 'F', '番': 'F', '翻': 'F', '凡': 'F', '烦': 'F', '反': 'F', '返': 'F', '犯': 'F', '饭': 'F', '泛': 'F', '方': 'F', '芳': 'F', '房': 'F', '防': 'F', '仿': 'F', '访': 'F', '纺': 'F', '放': 'F', '飞': 'F', '非': 'F', '肥': 'F', '废': 'F', '费': 'F', '分': 'F', '纷': 'F', '粉': 'F', '份': 'F', '奋': 'F', '愤': 'F', '丰': 'F', '风': 'F', '枫': 'F', '封': 'F', '疯': 'F', '锋': 'F', '逢': 'F', '凤': 'F', '佛': 'F', '夫': 'F', '肤': 'F', '扶': 'F', '服': 'F', '浮': 'F', '福': 'F', '府': 'F', '腐': 'F', '父': 'F', '负': 'F', '妇': 'F', '附': 'F', '复': 'F', '富': 'F',
    '该': 'G', '改': 'G', '盖': 'G', '干': 'G', '甘': 'G', '杆': 'G', '肝': 'G', '敢': 'G', '感': 'G', '刚': 'G', '钢': 'G', '港': 'G', '高': 'G', '告': 'G', '哥': 'G', '歌': 'G', '戈': 'G', '鸽': 'G', '割': 'G', '革': 'G', '格': 'G', '阁': 'G', '隔': 'G', '个': 'G', '各': 'G', '给': 'G', '根': 'G', '跟': 'G', '更': 'G', '工': 'G', '公': 'G', '功': 'G', '供': 'G', '宫': 'G', '恭': 'G', '共': 'G', '贡': 'G', '勾': 'G', '沟': 'G', '狗': 'G', '构': 'G', '购': 'G', '够': 'G', '孤': 'G', '姑': 'G', '古': 'G', '谷': 'G', '股': 'G', '骨': 'G', '故': 'G', '顾': 'G', '固': 'G', '瓜': 'G', '刮': 'G', '挂': 'G', '怪': 'G', '关': 'G', '官': 'G', '观': 'G', '管': 'G', '馆': 'G', '惯': 'G', '灌': 'G', '光': 'G', '广': 'G', '归': 'G', '龟': 'G', '规': 'G', '轨': 'G', '鬼': 'G', '贵': 'G', '桂': 'G', '滚': 'G', '国': 'G', '果': 'G', '过': 'G',
    '哈': 'H', '海': 'H', '害': 'H', '含': 'H', '寒': 'H', '喊': 'H', '汉': 'H', '杭': 'H', '航': 'H', '毫': 'H', '好': 'H', '号': 'H', '浩': 'H', '喝': 'H', '河': 'H', '荷': 'H', '核': 'H', '和': 'H', '合': 'H', '何': 'H', '贺': 'H', '黑': 'H', '痕': 'H', '很': 'H', '恨': 'H', '哼': 'H', '恒': 'H', '横': 'H', '衡': 'H', '轰': 'H', '红': 'H', '宏': 'H', '洪': 'H', '虹': 'H', '侯': 'H', '后': 'H', '厚': 'H', '呼': 'H', '乎': 'H', '忽': 'H', '狐': 'H', '胡': 'H', '湖': 'H', '糊': 'H', '虎': 'H', '互': 'H', '户': 'H', '花': 'H', '华': 'H', '滑': 'H', '化': 'H', '划': 'H', '画': 'H', '话': 'H', '怀': 'H', '坏': 'H', '欢': 'H', '还': 'H', '环': 'H', '缓': 'H', '换': 'H', '唤': 'H', '患': 'H', '荒': 'H', '慌': 'H', '黄': 'H', '煌': 'H', '灰': 'H', '挥': 'H', '辉': 'H', '回': 'H', '悔': 'H', '会': 'H', '绘': 'H', '婚': 'H', '混': 'H', '活': 'H', '火': 'H', '或': 'H', '货': 'H', '获': 'H',
    '击': 'J', '机': 'J', '鸡': 'J', '积': 'J', '基': 'J', '激': 'J', '及': 'J', '吉': 'J', '级': 'J', '即': 'J', '极': 'J', '急': 'J', '集': 'J', '籍': 'J', '纪': 'J', '技': 'J', '际': 'J', '剂': 'J', '济': 'J', '继': 'J', '寄': 'J', '加': 'J', '夹': 'J', '佳': 'J', '家': 'J', '甲': 'J', '价': 'J', '驾': 'J', '架': 'J', '假': 'J', '嫁': 'J', '坚': 'J', '间': 'J', '肩': 'J', '艰': 'J', '兼': 'J', '检': 'J', '简': 'J', '见': 'J', '件': 'J', '建': 'J', '剑': 'J', '荐': 'J', '贱': 'J', '健': 'J', '舰': 'J', '渐': 'J', '践': 'J', '鉴': 'J', '江': 'J', '将': 'J', '姜': 'J', '讲': 'J', '奖': 'J', '降': 'J', '交': 'J', '郊': 'J', '娇': 'J', '骄': 'J', '胶': 'J', '教': 'J', '阶': 'J', '皆': 'J', '接': 'J', '揭': 'J', '街': 'J', '节': 'J', '劫': 'J', '杰': 'J', '洁': 'J', '结': 'J', '解': 'J', '姐': 'J', '戒': 'J', '界': 'J', '借': 'J', '今': 'J', '金': 'J', '津': 'J', '筋': 'J', '仅': 'J', '紧': 'J', '谨': 'J', '尽': 'J', '进': 'J', '近': 'J', '晋': 'J', '浸': 'J', '京': 'J', '经': 'J', '惊': 'J', '晶': 'J', '精': 'J', '景': 'J', '警': 'J', '净': 'J', '静': 'J', '境': 'J', '敬': 'J', '纠': 'J', '究': 'J', '九': 'J', '久': 'J', '酒': 'J', '旧': 'J', '救': 'J', '就': 'J', '居': 'J', '局': 'J', '菊': 'J', '举': 'J', '巨': 'J', '拒': 'J', '具': 'J', '俱': 'J', '剧': 'J', '惧': 'J', '据': 'J', '距': 'J', '聚': 'J', '卷': 'J', '决': 'J', '绝': 'J', '觉': 'J', '军': 'J', '君': 'J', '均': 'J', '俊': 'J',
    '卡': 'K', '开': 'K', '凯': 'K', '刊': 'K', '看': 'K', '康': 'K', '抗': 'K', '考': 'K', '烤': 'K', '靠': 'K', '科': 'K', '可': 'K', '渴': 'K', '克': 'K', '刻': 'K', '客': 'K', '课': 'K', '肯': 'K', '坑': 'K', '空': 'K', '孔': 'K', '恐': 'K', '控': 'K', '口': 'K', '扣': 'K', '苦': 'K', '库': 'K', '裤': 'K', '夸': 'K', '跨': 'K', '块': 'K', '快': 'K', '宽': 'K', '款': 'K', '狂': 'K', '况': 'K', '亏': 'K', '葵': 'K', '愧': 'K', '困': 'K', '扩': 'K', '括': 'K',
    '拉': 'L', '啦': 'L', '腊': 'L', '来': 'L', '莱': 'L', '兰': 'L', '栏': 'L', '蓝': 'L', '览': 'L', '懒': 'L', '烂': 'L', '狼': 'L', '朗': 'L', '浪': 'L', '劳': 'L', '老': 'L', '乐': 'L', '雷': 'L', '累': 'L', '泪': 'L', '冷': 'L', '梨': 'L', '离': 'L', '璃': 'L', '黎': 'L', '礼': 'L', '李': 'L', '里': 'L', '理': 'L', '力': 'L', '历': 'L', '立': 'L', '丽': 'L', '利': 'L', '励': 'L', '例': 'L', '隶': 'L', '连': 'L', '帘': 'L', '怜': 'L', '莲': 'L', '联': 'L', '廉': 'L', '练': 'L', '炼': 'L', '恋': 'L', '良': 'L', '凉': 'L', '梁': 'L', '粮': 'L', '两': 'L', '亮': 'L', '谅': 'L', '辽': 'L', '聊': 'L', '僚': 'L', '寥': 'L', '了': 'L', '料': 'L', '列': 'L', '劣': 'L', '烈': 'L', '猎': 'L', '林': 'L', '临': 'L', '淋': 'L', '灵': 'L', '玲': 'L', '凌': 'L', '铃': 'L', '陵': 'L', '领': 'L', '岭': 'L', '令': 'L', '溜': 'L', '刘': 'L', '流': 'L', '留': 'L', '柳': 'L', '六': 'L', '龙': 'L', '隆': 'L', '楼': 'L', '漏': 'L', '露': 'L', '卢': 'L', '录': 'L', '路': 'L', '鹿': 'L', '旅': 'L', '律': 'L', '虑': 'L', '绿': 'L', '乱': 'L', '略': 'L', '伦': 'L', '轮': 'L', '论': 'L', '罗': 'L', '萝': 'L', '逻': 'L', '螺': 'L', '落': 'L',
    '妈': 'M', '麻': 'M', '马': 'M', '码': 'M', '骂': 'M', '吗': 'M', '埋': 'M', '买': 'M', '麦': 'M', '卖': 'M', '脉': 'M', '蛮': 'M', '满': 'M', '曼': 'M', '慢': 'M', '漫': 'M', '忙': 'M', '芒': 'M', '盲': 'M', '猫': 'M', '毛': 'M', '矛': 'M', '茂': 'M', '貌': 'M', '么': 'M', '没': 'M', '眉': 'M', '梅': 'M', '媒': 'M', '每': 'M', '美': 'M', '妹': 'M', '门': 'M', '们': 'M', '蒙': 'M', '盟': 'M', '猛': 'M', '梦': 'M', '迷': 'M', '谜': 'M', '米': 'M', '秘': 'M', '密': 'M', '棉': 'M', '免': 'M', '勉': 'M', '面': 'M', '苗': 'M', '描': 'M', '秒': 'M', '妙': 'M', '灭': 'M', '民': 'M', '敏': 'M', '名': 'M', '明': 'M', '命': 'M', '摸': 'M', '模': 'M', '膜': 'M', '磨': 'M', '末': 'M', '沫': 'M', '莫': 'M', '漠': 'M', '墨': 'M', '默': 'M', '谋': 'M', '某': 'M', '母': 'M', '亩': 'M', '木': 'M', '目': 'M', '牧': 'M', '墓': 'M', '幕': 'M', '慕': 'M',
    '拿': 'N', '哪': 'N', '内': 'N', '那': 'N', '纳': 'N', '乃': 'N', '奶': 'N', '奈': 'N', '男': 'N', '南': 'N', '难': 'N', '脑': 'N', '恼': 'N', '闹': 'N', '呢': 'N', '嫩': 'N', '能': 'N', '尼': 'N', '泥': 'N', '你': 'N', '拟': 'N', '逆': 'N', '年': 'N', '念': 'N', '娘': 'N', '酿': 'N', '鸟': 'N', '尿': 'N', '捏': 'N', '宁': 'N', '凝': 'N', '牛': 'N', '扭': 'N', '浓': 'N', '农': 'N', '弄': 'N', '奴': 'N', '努': 'N', '怒': 'N', '女': 'N', '暖': 'N', '虐': 'N',
    '欧': 'O', '偶': 'O',
    '爬': 'P', '怕': 'P', '拍': 'P', '排': 'P', '牌': 'P', '派': 'P', '攀': 'P', '盘': 'P', '判': 'P', '叛': 'P', '旁': 'P', '胖': 'P', '抛': 'P', '炮': 'P', '跑': 'P', '泡': 'P', '陪': 'P', '培': 'P', '佩': 'P', '配': 'P', '喷': 'P', '盆': 'P', '朋': 'P', '棚': 'P', '蓬': 'P', '鹏': 'P', '捧': 'P', '碰': 'P', '批': 'P', '披': 'P', '皮': 'P', '疲': 'P', '脾': 'P', '匹': 'P', '屁': 'P', '僻': 'P', '片': 'P', '偏': 'P', '篇': 'P', '骗': 'P', '飘': 'P', '漂': 'P', '票': 'P', '撇': 'P', '拼': 'P', '贫': 'P', '品': 'P', '聘': 'P', '平': 'P', '评': 'P', '凭': 'P', '苹': 'P', '萍': 'P', '坡': 'P', '泼': 'P', '颇': 'P', '婆': 'P', '迫': 'P', '破': 'P', '魄': 'P', '剖': 'P', '扑': 'P', '铺': 'P', '葡': 'P', '朴': 'P', '圃': 'P', '浦': 'P', '普': 'P', '谱': 'P',
    '七': 'Q', '妻': 'Q', '戚': 'Q', '期': 'Q', '欺': 'Q', '漆': 'Q', '齐': 'Q', '其': 'Q', '奇': 'Q', '歧': 'Q', '骑': 'Q', '棋': 'Q', '旗': 'Q', '乞': 'Q', '企': 'Q', '岂': 'Q', '启': 'Q', '起': 'Q', '气': 'Q', '弃': 'Q', '汽': 'Q', '砌': 'Q', '器': 'Q', '恰': 'Q', '洽': 'Q', '千': 'Q', '迁': 'Q', '牵': 'Q', '铅': 'Q', '谦': 'Q', '签': 'Q', '前': 'Q', '钱': 'Q', '钳': 'Q', '潜': 'Q', '浅': 'Q', '遣': 'Q', '谴': 'Q', '欠': 'Q', '枪': 'Q', '腔': 'Q', '强': 'Q', '墙': 'Q', '抢': 'Q', '悄': 'Q', '敲': 'Q', '锹': 'Q', '乔': 'Q', '侨': 'Q', '桥': 'Q', '瞧': 'Q', '巧': 'Q', '切': 'Q', '且': 'Q', '窃': 'Q', '亲': 'Q', '侵': 'Q', '钦': 'Q', '琴': 'Q', '禽': 'Q', '勤': 'Q', '擒': 'Q', '寝': 'Q', '沁': 'Q', '青': 'Q', '轻': 'Q', '氢': 'Q', '倾': 'Q', '卿': 'Q', '清': 'Q', '晴': 'Q', '情': 'Q', '顷': 'Q', '请': 'Q', '庆': 'Q', '穷': 'Q', '琼': 'Q', '秋': 'Q', '丘': 'Q', '求': 'Q', '区': 'Q', '曲': 'Q', '驱': 'Q', '屈': 'Q', '躯': 'Q', '趋': 'Q', '渠': 'Q', '取': 'Q', '去': 'Q', '趣': 'Q', '圈': 'Q', '权': 'Q', '全': 'Q', '泉': 'Q', '拳': 'Q', '犬': 'Q', '劝': 'Q', '券': 'Q', '缺': 'Q', '却': 'Q', '确': 'Q', '鹊': 'Q', '裙': 'Q', '群': 'Q',
    '然': 'R', '燃': 'R', '染': 'R', '嚷': 'R', '壤': 'R', '让': 'R', '饶': 'R', '扰': 'R', '绕': 'R', '惹': 'R', '热': 'R', '人': 'R', '仁': 'R', '忍': 'R', '认': 'R', '任': 'R', '刃': 'R', '纫': 'R', '扔': 'R', '仍': 'R', '日': 'R', '荣': 'R', '绒': 'R', '容': 'R', '熔': 'R', '溶': 'R', '融': 'R', '冗': 'R', '柔': 'R', '肉': 'R', '如': 'R', '儒': 'R', '孺': 'R', '辱': 'R', '乳': 'R', '入': 'R', '软': 'R', '锐': 'R', '瑞': 'R', '润': 'R', '若': 'R', '弱': 'R',
    '撒': 'S', '洒': 'S', '塞': 'S', '赛': 'S', '三': 'S', '伞': 'S', '散': 'S', '桑': 'S', '嗓': 'S', '丧': 'S', '扫': 'S', '嫂': 'S', '色': 'S', '涩': 'S', '森': 'S', '僧': 'S', '杀': 'S', '沙': 'S', '纱': 'S', '刹': 'S', '砂': 'S', '傻': 'S', '煞': 'S', '筛': 'S', '晒': 'S', '山': 'S', '杉': 'S', '衫': 'S', '闪': 'S', '陕': 'S', '扇': 'S', '善': 'S', '伤': 'S', '商': 'S', '赏': 'S', '上': 'S', '尚': 'S', '捎': 'S', '梢': 'S', '烧': 'S', '稍': 'S', '少': 'S', '绍': 'S', '哨': 'S', '奢': 'S', '舌': 'S', '蛇': 'S', '舍': 'S', '设': 'S', '社': 'S', '射': 'S', '涉': 'S', '摄': 'S', '申': 'S', '伸': 'S', '身': 'S', '深': 'S', '神': 'S', '审': 'S', '婶': 'S', '肾': 'S', '甚': 'S', '渗': 'S', '慎': 'S', '升': 'S', '生': 'S', '声': 'S', '牲': 'S', '胜': 'S', '绳': 'S', '省': 'S', '圣': 'S', '剩': 'S', '尸': 'S', '失': 'S', '师': 'S', '诗': 'S', '狮': 'S', '施': 'S', '湿': 'S', '十': 'S', '什': 'S', '石': 'S', '时': 'S', '识': 'S', '实': 'S', '拾': 'S', '食': 'S', '蚀': 'S', '史': 'S', '使': 'S', '始': 'S', '士': 'S', '氏': 'S', '世': 'S', '市': 'S', '示': 'S', '式': 'S', '事': 'S', '侍': 'S', '势': 'S', '视': 'S', '试': 'S', '饰': 'S', '室': 'S', '是': 'S', '适': 'S', '逝': 'S', '释': 'S', '誓': 'S', '收': 'S', '手': 'S', '守': 'S', '首': 'S', '寿': 'S', '受': 'S', '兽': 'S', '售': 'S', '授': 'S', '瘦': 'S', '书': 'S', '抒': 'S', '枢': 'S', '叔': 'S', '殊': 'S', '梳': 'S', '淑': 'S', '疏': 'S', '舒': 'S', '输': 'S', '蔬': 'S', '熟': 'S', '暑': 'S', '黍': 'S', '署': 'S', '属': 'S', '术': 'S', '束': 'S', '述': 'S', '树': 'S', '竖': 'S', '恕': 'S', '刷': 'S', '耍': 'S', '衰': 'S', '摔': 'S', '甩': 'S', '帅': 'S', '拴': 'S', '霜': 'S', '双': 'S', '爽': 'S', '谁': 'S', '水': 'S', '税': 'S', '睡': 'S', '顺': 'S', '瞬': 'S', '说': 'S', '丝': 'S', '司': 'S', '私': 'S', '思': 'S', '斯': 'S', '死': 'S', '四': 'S', '寺': 'S', '似': 'S', '饲': 'S', '肆': 'S', '松': 'S', '宋': 'S', '送': 'S', '颂': 'S', '诵': 'S', '搜': 'S', '苏': 'S', '俗': 'S', '素': 'S', '速': 'S', '宿': 'S', '塑': 'S', '溯': 'S', '酸': 'S', '蒜': 'S', '算': 'S', '虽': 'S', '随': 'S', '髓': 'S', '岁': 'S', '祟': 'S', '遂': 'S', '碎': 'S', '穗': 'S', '孙': 'S', '损': 'S', '笋': 'S', '蓑': 'S', '梭': 'S', '唆': 'S', '缩': 'S', '所': 'S', '索': 'S', '锁': 'S',
    '塌': 'T', '他': 'T', '它': 'T', '她': 'T', '塔': 'T', '踏': 'T', '胎': 'T', '台': 'T', '抬': 'T', '太': 'T', '态': 'T', '泰': 'T', '贪': 'T', '摊': 'T', '滩': 'T', '坛': 'T', '谈': 'T', '潭': 'T', '坦': 'T', '叹': 'T', '炭': 'T', '探': 'T', '汤': 'T', '唐': 'T', '堂': 'T', '塘': 'T', '糖': 'T', '倘': 'T', '淌': 'T', '躺': 'T', '烫': 'T', '涛': 'T', '掏': 'T', '逃': 'T', '桃': 'T', '陶': 'T', '淘': 'T', '讨': 'T', '套': 'T', '特': 'T', '疼': 'T', '腾': 'T', '梯': 'T', '踢': 'T', '啼': 'T', '提': 'T', '题': 'T', '蹄': 'T', '体': 'T', '替': 'T', '天': 'T', '添': 'T', '田': 'T', '填': 'T', '甜': 'T', '舔': 'T', '挑': 'T', '条': 'T', '迢': 'T', '跳': 'T', '贴': 'T', '铁': 'T', '厅': 'T', '听': 'T', '廷': 'T', '亭': 'T', '庭': 'T', '停': 'T', '挺': 'T', '艇': 'T', '通': 'T', '同': 'T', '桐': 'T', '铜': 'T', '童': 'T', '统': 'T', '桶': 'T', '筒': 'T', '痛': 'T', '偷': 'T', '投': 'T', '头': 'T', '透': 'T', '凸': 'T', '秃': 'T', '突': 'T', '图': 'T', '徒': 'T', '涂': 'T', '途': 'T', '屠': 'T', '土': 'T', '吐': 'T', '兔': 'T', '团': 'T', '推': 'T', '颓': 'T', '腿': 'T', '退': 'T', '吞': 'T', '屯': 'T', '托': 'T', '拖': 'T', '脱': 'T', '陀': 'T', '驼': 'T', '妥': 'T', '拓': 'T', '唾': 'T',
    '挖': 'W', '哇': 'W', '蛙': 'W', '娃': 'W', '瓦': 'W', '歪': 'W', '外': 'W', '弯': 'W', '湾': 'W', '丸': 'W', '完': 'W', '玩': 'W', '顽': 'W', '挽': 'W', '晚': 'W', '碗': 'W', '万': 'W', '汪': 'W', '亡': 'W', '王': 'W', '网': 'W', '往': 'W', '妄': 'W', '忘': 'W', '旺': 'W', '望': 'W', '危': 'W', '威': 'W', '微': 'W', '为': 'W', '围': 'W', '唯': 'W', '维': 'W', '伟': 'W', '伪': 'W', '尾': 'W', '委': 'W', '卫': 'W', '未': 'W', '位': 'W', '味': 'W', '畏': 'W', '胃': 'W', '喂': 'W', '温': 'W', '文': 'W', '纹': 'W', '蚊': 'W', '闻': 'W', '吻': 'W', '稳': 'W', '问': 'W', '翁': 'W', '窝': 'W', '我': 'W', '沃': 'W', '卧': 'W', '握': 'W', '乌': 'W', '污': 'W', '呜': 'W', '巫': 'W', '诬': 'W', '屋': 'W', '无': 'W', '吴': 'W', '吾': 'W', '梧': 'W', '五': 'W', '午': 'W', '伍': 'W', '武': 'W', '捂': 'W', '鹉': 'W', '舞': 'W', '勿': 'W', '务': 'W', '戊': 'W', '物': 'W', '误': 'W', '悟': 'W', '晤': 'W', '雾': 'W',
    '夕': 'X', '西': 'X', '吸': 'X', '希': 'X', '昔': 'X', '析': 'X', '牺': 'X', '息': 'X', '惜': 'X', '悉': 'X', '蟋': 'X', '锡': 'X', '熙': 'X', '嘻': 'X', '嬉': 'X', '膝': 'X', '习': 'X', '席': 'X', '袭': 'X', '媳': 'X', '洗': 'X', '喜': 'X', '戏': 'X', '系': 'X', '细': 'X', '隙': 'X', '虾': 'X', '瞎': 'X', '峡': 'X', '狭': 'X', '匣': 'X', '霞': 'X', '辖': 'X', '暇': 'X', '下': 'X', '夏': 'X', '吓': 'X', '掀': 'X', '先': 'X', '仙': 'X', '纤': 'X', '鲜': 'X', '闲': 'X', '贤': 'X', '咸': 'X', '涎': 'X', '衔': 'X', '嫌': 'X', '显': 'X', '险': 'X', '县': 'X', '现': 'X', '限': 'X', '线': 'X', '宪': 'X', '陷': 'X', '馅': 'X', '羡': 'X', '献': 'X', '腺': 'X', '乡': 'X', '相': 'X', '香': 'X', '厢': 'X', '湘': 'X', '箱': 'X', '详': 'X', '祥': 'X', '翔': 'X', '享': 'X', '响': 'X', '想': 'X', '向': 'X', '巷': 'X', '项': 'X', '象': 'X', '像': 'X', '橡': 'X', '削': 'X', '消': 'X', '宵': 'X', '硝': 'X', '霄': 'X', '淆': 'X', '小': 'X', '晓': 'X', '孝': 'X', '效': 'X', '校': 'X', '笑': 'X', '些': 'X', '歇': 'X', '蝎': 'X', '协': 'X', '邪': 'X', '胁': 'X', '斜': 'X', '谐': 'X', '携': 'X', '鞋': 'X', '写': 'X', '泄': 'X', '泻': 'X', '卸': 'X', '屑': 'X', '械': 'X', '谢': 'X', '懈': 'X', '蟹': 'X', '心': 'X', '辛': 'X', '欣': 'X', '新': 'X', '薪': 'X', '信': 'X', '衅': 'X', '兴': 'X', '星': 'X', '腥': 'X', '刑': 'X', '行': 'X', '形': 'X', '型': 'X', '醒': 'X', '杏': 'X', '姓': 'X', '幸': 'X', '性': 'X', '凶': 'X', '兄': 'X', '匈': 'X', '汹': 'X', '胸': 'X', '雄': 'X', '熊': 'X', '休': 'X', '修': 'X', '羞': 'X', '朽': 'X', '秀': 'X', '袖': 'X', '绣': 'X', '锈': 'X', '嗅': 'X', '虚': 'X', '需': 'X', '徐': 'X', '许': 'X', '序': 'X', '叙': 'X', '畜': 'X', '绪': 'X', '续': 'X', '絮': 'X', '婿': 'X', '蓄': 'X', '宣': 'X', '玄': 'X', '悬': 'X', '旋': 'X', '选': 'X', '癣': 'X', '炫': 'X', '眩': 'X', '绚': 'X', '靴': 'X', '学': 'X', '穴': 'X', '雪': 'X', '血': 'X', '勋': 'X', '熏': 'X', '寻': 'X', '巡': 'X', '旬': 'X', '驯': 'X', '询': 'X', '循': 'X',
    '压': 'Y', '呀': 'Y', '鸦': 'Y', '鸭': 'Y', '牙': 'Y', '芽': 'Y', '蚜': 'Y', '崖': 'Y', '涯': 'Y', '雅': 'Y', '亚': 'Y', '咽': 'Y', '烟': 'Y', '淹': 'Y', '盐': 'Y', '严': 'Y', '言': 'Y', '岩': 'Y', '炎': 'Y', '沿': 'Y', '研': 'Y', '蜒': 'Y', '颜': 'Y', '掩': 'Y', '眼': 'Y', '演': 'Y', '厌': 'Y', '宴': 'Y', '艳': 'Y', '验': 'Y', '谚': 'Y', '焰': 'Y', '雁': 'Y', '燕': 'Y', '央': 'Y', '殃': 'Y', '秧': 'Y', '扬': 'Y', '羊': 'Y', '阳': 'Y', '杨': 'Y', '佯': 'Y', '洋': 'Y', '仰': 'Y', '养': 'Y', '氧': 'Y', '痒': 'Y', '样': 'Y', '夭': 'Y', '妖': 'Y', '腰': 'Y', '邀': 'Y', '窑': 'Y', '谣': 'Y', '摇': 'Y', '遥': 'Y', '瑶': 'Y', '咬': 'Y', '药': 'Y', '要': 'Y', '耀': 'Y', '爷': 'Y', '耶': 'Y', '野': 'Y', '也': 'Y', '冶': 'Y', '页': 'Y', '夜': 'Y', '液': 'Y', '一': 'Y', '衣': 'Y', '医': 'Y', '依': 'Y', '伊': 'Y', '夷': 'Y', '宜': 'Y', '移': 'Y', '遗': 'Y', '疑': 'Y', '乙': 'Y', '已': 'Y', '以': 'Y', '矣': 'Y', '艺': 'Y', '亿': 'Y', '义': 'Y', '忆': 'Y', '议': 'Y', '亦': 'Y', '异': 'Y', '役': 'Y', '抑': 'Y', '译': 'Y', '易': 'Y', '疫': 'Y', '益': 'Y', '谊': 'Y', '逸': 'Y', '意': 'Y', '溢': 'Y', '毅': 'Y', '翼': 'Y', '因': 'Y', '阴': 'Y', '音': 'Y', '姻': 'Y', '吟': 'Y', '银': 'Y', '引': 'Y', '饮': 'Y', '隐': 'Y', '印': 'Y', '英': 'Y', '婴': 'Y', '鹰': 'Y', '迎': 'Y', '盈': 'Y', '营': 'Y', '蝇': 'Y', '赢': 'Y', '影': 'Y', '映': 'Y', '硬': 'Y', '哟': 'Y', '拥': 'Y', '佣': 'Y', '痈': 'Y', '庸': 'Y', '雍': 'Y', '永': 'Y', '泳': 'Y', '勇': 'Y', '涌': 'Y', '用': 'Y', '优': 'Y', '忧': 'Y', '悠': 'Y', '尤': 'Y', '由': 'Y', '犹': 'Y', '油': 'Y', '游': 'Y', '友': 'Y', '有': 'Y', '又': 'Y', '右': 'Y', '幼': 'Y', '诱': 'Y', '于': 'Y', '予': 'Y', '余': 'Y', '鱼': 'Y', '娱': 'Y', '渔': 'Y', '愉': 'Y', '愚': 'Y', '榆': 'Y', '与': 'Y', '宇': 'Y', '羽': 'Y', '雨': 'Y', '语': 'Y', '玉': 'Y', '育': 'Y', '郁': 'Y', '狱': 'Y', '浴': 'Y', '预': 'Y', '域': 'Y', '欲': 'Y', '喻': 'Y', '寓': 'Y', '御': 'Y', '裕': 'Y', '遇': 'Y', '愈': 'Y', '誉': 'Y', '豫': 'Y', '冤': 'Y', '元': 'Y', '园': 'Y', '员': 'Y', '原': 'Y', '圆': 'Y', '袁': 'Y', '援': 'Y', '缘': 'Y', '源': 'Y', '猿': 'Y', '远': 'Y', '怨': 'Y', '院': 'Y', '愿': 'Y', '曰': 'Y', '约': 'Y', '月': 'Y', '岳': 'Y', '悦': 'Y', '阅': 'Y', '跃': 'Y',
    '杂': 'Z', '砸': 'Z', '灾': 'Z', '栽': 'Z', '宰': 'Z', '载': 'Z', '再': 'Z', '在': 'Z', '咱': 'Z', '攒': 'Z', '暂': 'Z', '赞': 'Z', '赃': 'Z', '脏': 'Z', '葬': 'Z', '遭': 'Z', '糟': 'Z', '凿': 'Z', '早': 'Z', '枣': 'Z', '澡': 'Z', '藻': 'Z', '皂': 'Z', '灶': 'Z', '燥': 'Z', '躁': 'Z', '则': 'Z', '择': 'Z', '泽': 'Z', '贼': 'Z', '怎': 'Z', '增': 'Z', '憎': 'Z', '赠': 'Z', '扎': 'Z', '札': 'Z', '轧': 'Z', '闸': 'Z', '炸': 'Z', '诈': 'Z', '榨': 'Z', '摘': 'Z', '宅': 'Z', '窄': 'Z', '债': 'Z', '寨': 'Z', '沾': 'Z', '斩': 'Z', '展': 'Z', '盏': 'Z', '崭': 'Z', '占': 'Z', '战': 'Z', '站': 'Z', '绽': 'Z', '章': 'Z', '张': 'Z', '彰': 'Z', '樟': 'Z', '涨': 'Z', '掌': 'Z', '丈': 'Z', '仗': 'Z', '帐': 'Z', '账': 'Z', '胀': 'Z', '障': 'Z', '招': 'Z', '找': 'Z', '召': 'Z', '兆': 'Z', '照': 'Z', '罩': 'Z', '遮': 'Z', '折': 'Z', '哲': 'Z', '者': 'Z', '这': 'Z', '浙': 'Z', '针': 'Z', '侦': 'Z', '珍': 'Z', '真': 'Z', '诊': 'Z', '枕': 'Z', '阵': 'Z', '振': 'Z', '镇': 'Z', '震': 'Z', '睁': 'Z', '争': 'Z', '征': 'Z', '挣': 'Z', '筝': 'Z', '蒸': 'Z', '整': 'Z', '正': 'Z', '证': 'Z', '郑': 'Z', '政': 'Z', '症': 'Z', '之': 'Z', '支': 'Z', '只': 'Z', '汁': 'Z', '芝': 'Z', '枝': 'Z', '知': 'Z', '织': 'Z', '肢': 'Z', '脂': 'Z', '蜘': 'Z', '执': 'Z', '直': 'Z', '值': 'Z', '职': 'Z', '植': 'Z', '殖': 'Z', '止': 'Z', '旨': 'Z', '址': 'Z', '纸': 'Z', '指': 'Z', '至': 'Z', '志': 'Z', '制': 'Z', '帜': 'Z', '治': 'Z', '质': 'Z', '致': 'Z', '秩': 'Z', '智': 'Z', '置': 'Z', '稚': 'Z', '中': 'Z', '忠': 'Z', '终': 'Z', '钟': 'Z', '肿': 'Z', '种': 'Z', '仲': 'Z', '众': 'Z', '重': 'Z', '州': 'Z', '舟': 'Z', '周': 'Z', '洲': 'Z', '粥': 'Z', '轴': 'Z', '肘': 'Z', '帚': 'Z', '咒': 'Z', '皱': 'Z', '昼': 'Z', '骤': 'Z', '朱': 'Z', '株': 'Z', '珠': 'Z', '诸': 'Z', '猪': 'Z', '竹': 'Z', '烛': 'Z', '逐': 'Z', '主': 'Z', '煮': 'Z', '嘱': 'Z', '住': 'Z', '助': 'Z', '注': 'Z', '驻': 'Z', '柱': 'Z', '祝': 'Z', '著': 'Z', '筑': 'Z', '铸': 'Z', '抓': 'Z', '爪': 'Z', '专': 'Z', '砖': 'Z', '转': 'Z', '赚': 'Z', '庄': 'Z', '桩': 'Z', '装': 'Z', '壮': 'Z', '状': 'Z', '撞': 'Z', '追': 'Z', '准': 'Z', '捉': 'Z', '桌': 'Z', '琢': 'Z', '着': 'Z', '仔': 'Z', '兹': 'Z', '姿': 'Z', '资': 'Z', '滋': 'Z', '紫': 'Z', '子': 'Z', '姊': 'Z', '籽': 'Z', '字': 'Z', '自': 'Z', '宗': 'Z', '棕': 'Z', '踪': 'Z', '总': 'Z', '纵': 'Z', '走': 'Z', '奏': 'Z', '租': 'Z', '足': 'Z', '卒': 'Z', '族': 'Z', '阻': 'Z', '组': 'Z', '祖': 'Z', '钻': 'Z', '嘴': 'Z', '最': 'Z', '罪': 'Z', '醉': 'Z', '尊': 'Z', '遵': 'Z', '昨': 'Z', '左': 'Z', '佐': 'Z', '作': 'Z', '坐': 'Z', '座': 'Z', '做': 'Z'
  };
  return pinyinMap[firstChar] || '#';
}

// 搜索结果数据结构
interface SearchMatch {
  song: Song;
  matchType: 'name' | 'lyrics' | 'lyricist' | 'composer';
  matchCount: number;
  snippets: { text: string; highlightStart: number; highlightEnd: number }[];
}

// 提取匹配片段
function extractSnippets(lyrics: string, query: string, maxSnippets = 3): { text: string; highlightStart: number; highlightEnd: number }[] {
  const snippets: { text: string; highlightStart: number; highlightEnd: number }[] = [];
  const lowerLyrics = lyrics.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  let index = 0;
  while (snippets.length < maxSnippets && index < lowerLyrics.length) {
    const matchIndex = lowerLyrics.indexOf(lowerQuery, index);
    if (matchIndex === -1) break;
    
    // 提取前后20个字符
    const start = Math.max(0, matchIndex - 20);
    const end = Math.min(lyrics.length, matchIndex + query.length + 20);
    const snippet = lyrics.substring(start, end);
    
    snippets.push({
      text: snippet,
      highlightStart: matchIndex - start,
      highlightEnd: matchIndex - start + query.length
    });
    
    index = matchIndex + 1;
  }
  
  return snippets;
}

// 统计匹配次数
function countMatches(text: string, query: string): number {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let count = 0;
  let index = 0;
  
  while ((index = lowerText.indexOf(lowerQuery, index)) !== -1) {
    count++;
    index += 1;
  }
  
  return count;
}

interface SongListProps {
  songs: Song[];
  viewMode: ViewMode;
  selectedYear: string | null;
  selectedAlbum: string | null;
  searchQuery: string;
  searchScope: 'name' | 'lyrics' | 'all' | 'wordfreq';
  favorites: number[];
  onToggleFavorite: (songId: number) => void;
  onSelectSong: (song: Song) => void;
  getCommentCount: (songId: number) => number;
}

export function SongList({
  songs,
  viewMode,
  selectedYear,
  selectedAlbum,
  searchQuery,
  searchScope,
  favorites,
  onToggleFavorite,
  onSelectSong,
  getCommentCount,
}: SongListProps) {
  const [visibleSongs, setVisibleSongs] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const songRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // 搜索过滤和增强
  const searchResults = useMemo<SearchMatch[]>(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    const results: SearchMatch[] = [];
    
    songs.forEach(song => {
      let matchType: SearchMatch['matchType'] | null = null;
      let matchCount = 0;
      let snippets: SearchMatch['snippets'] = [];
      
      // 检查歌名匹配
      if (searchScope === 'all' || searchScope === 'name') {
        const nameMatches = countMatches(song.name, query);
        if (nameMatches > 0) {
          matchType = 'name';
          matchCount = nameMatches;
        }
      }
      
      // 检查歌词匹配
      if ((searchScope === 'all' || searchScope === 'lyrics' || searchScope === 'wordfreq') && song.lyrics) {
        const lyricsMatches = countMatches(song.lyrics, query);
        if (lyricsMatches > 0) {
          matchType = matchType || 'lyrics';
          matchCount = Math.max(matchCount, lyricsMatches);
          snippets = extractSnippets(song.lyrics, query);
        }
      }
      
      // 检查词作人匹配
      if ((searchScope === 'all' || searchScope === 'wordfreq') && song.lyricist) {
        const lyricistMatches = countMatches(song.lyricist, query);
        if (lyricistMatches > 0) {
          matchType = matchType || 'lyricist';
          matchCount = Math.max(matchCount, lyricistMatches);
        }
      }
      
      // 检查曲作人匹配
      if ((searchScope === 'all' || searchScope === 'wordfreq') && song.composer) {
        const composerMatches = countMatches(song.composer, query);
        if (composerMatches > 0) {
          matchType = matchType || 'composer';
          matchCount = Math.max(matchCount, composerMatches);
        }
      }
      
      if (matchType) {
        results.push({ song, matchType, matchCount, snippets });
      }
    });
    
    // 按匹配次数排序
    return results.sort((a, b) => b.matchCount - a.matchCount);
  }, [songs, searchQuery, searchScope]);

  // 过滤歌曲
  const filteredSongs = useMemo(() => {
    let result = [...songs];

    // 收藏模式
    if (viewMode === 'favorites') {
      result = result.filter(song => favorites.includes(song.id));
    }

    // 年份筛选
    if (selectedYear) {
      result = result.filter(song => song.year_only === selectedYear);
    }

    // 专辑筛选
    if (selectedAlbum) {
      if (selectedAlbum === '单曲') {
        // 单曲 = 没有专辑的歌曲
        result = result.filter(song => !song.album);
      } else {
        result = result.filter(song => song.album === selectedAlbum);
      }
    }

    return result;
  }, [songs, viewMode, selectedYear, selectedAlbum, favorites]);

  // 按视图模式分组
  const groupedSongs = useMemo(() => {
    if (viewMode === 'album') {
      const groups: Record<string, Song[]> = {};
      filteredSongs.forEach(song => {
        const key = song.album || '单曲';
        if (!groups[key]) groups[key] = [];
        groups[key].push(song);
      });
      return Object.entries(groups);
    } else if (viewMode === 'alphabet') {
      const groups: Record<string, Song[]> = {};
      filteredSongs.forEach(song => {
        const key = getFirstLetter(song);
        if (!groups[key]) groups[key] = [];
        groups[key].push(song);
      });
      return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
    } else {
      const groups: Record<string, Song[]> = {};
      filteredSongs.forEach(song => {
        const key = song.year_only;
        if (!groups[key]) groups[key] = [];
        groups[key].push(song);
      });
      return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
    }
  }, [filteredSongs, viewMode]);

  // 获取可用的首字母列表
  const availableLetters = useMemo(() => {
    if (viewMode !== 'alphabet') return [];
    return groupedSongs.map(([letter]) => letter).sort();
  }, [groupedSongs, viewMode]);

  // 滚动到指定字母
  const scrollToLetter = (letter: string) => {
    const element = document.getElementById(`section-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 无限滚动观察
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const songId = Number(entry.target.getAttribute('data-song-id'));
          if (entry.isIntersecting) {
            setVisibleSongs(prev => new Set([...prev, songId]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    songRefs.current.forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [groupedSongs]);

  const setSongRef = (songId: number) => (el: HTMLDivElement | null) => {
    if (el) {
      songRefs.current.set(songId, el);
      observerRef.current?.observe(el);
    }
  };

  // 渲染高亮文本
  const renderHighlightedSnippet = (snippet: { text: string; highlightStart: number; highlightEnd: number }) => {
    const before = snippet.text.substring(0, snippet.highlightStart);
    const highlight = snippet.text.substring(snippet.highlightStart, snippet.highlightEnd);
    const after = snippet.text.substring(snippet.highlightEnd);
    
    return (
      <span>
        {before.length > 0 && <span className="text-ink-light">...{before}</span>}
        <span className="bg-[#FFF9C4] text-ink font-medium px-0.5">{highlight}</span>
        {after.length > 0 && <span className="text-ink-light">{after}...</span>}
      </span>
    );
  };

  // 搜索结果视图
  if (searchQuery.trim() && searchResults.length > 0) {
    return (
      <div className="space-y-4 pb-20">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-4 h-4 text-cinnabar" />
          <span className="text-sm text-ink-light">
            搜索结果（共 {searchResults.length} 条）
          </span>
        </div>
        
        {searchResults.map(({ song, matchCount, snippets }) => (
          <div
            key={song.id}
            onClick={() => onSelectSong(song)}
            className="group p-4 bg-paper-light rounded-lg border border-ink-pale/20 hover:border-cinnabar/30 hover:shadow-md cursor-pointer transition-all"
          >
            {/* 歌曲信息 */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-medium text-ink group-hover:text-cinnabar transition-colors">
                  {song.name}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-ink-light">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {song.lyricist || '未知'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {song.year_only}
                  </span>
                  {song.album && (
                    <span className="flex items-center gap-1">
                      <Disc className="w-3 h-3" />
                      {song.album}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-cinnabar/10 text-cinnabar rounded-full">
                  {matchCount} 次匹配
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(song.id);
                  }}
                  className={`p-1.5 rounded transition-all ${
                    favorites.includes(song.id)
                      ? 'text-cinnabar'
                      : 'text-ink-pale hover:text-cinnabar'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(song.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
            
            {/* 匹配片段 */}
            {snippets.length > 0 && (
              <div className="mt-3 pt-3 border-t border-ink-pale/10">
                <div className="text-xs text-ink-light mb-2 flex items-center gap-1">
                  <Music className="w-3 h-3" />
                  匹配片段：
                </div>
                <div className="space-y-1.5">
                  {snippets.map((snippet, idx) => (
                    <div key={idx} className="text-sm leading-relaxed">
                      {renderHighlightedSnippet(snippet)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // 无搜索结果
  if (searchQuery.trim() && searchResults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-ink-light">
        <Search className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-lg">未找到匹配的歌曲</p>
        <p className="text-sm mt-2">尝试使用其他关键词</p>
      </div>
    );
  }

  if (filteredSongs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-ink-light">
        <div className="text-6xl mb-4 opacity-20">无</div>
        <p className="text-lg">没有找到匹配的歌曲</p>
        <p className="text-sm mt-2">试着调整筛选条件</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* 首字母索引栏 - 仅在alphabet视图显示 */}
      {viewMode === 'alphabet' && availableLetters.length > 0 && (
        <div className="sticky top-16 z-20 bg-paper/95 backdrop-blur-sm py-3 border-b border-ink-pale/10">
          <div className="flex flex-wrap gap-1.5 justify-center">
            {availableLetters.map(letter => (
              <button
                key={letter}
                onClick={() => scrollToLetter(letter)}
                className="w-8 h-8 rounded-md bg-paper-light border border-ink-pale/20 
                  text-ink text-sm font-medium hover:bg-cinnabar/10 hover:border-cinnabar/30 
                  hover:text-cinnabar transition-all duration-200"
                title={`跳转到 ${letter}`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      )}

      {groupedSongs.map(([group, groupSongs]) => (
        <div key={group} id={`section-${group}`} className="space-y-3 scroll-mt-32">
          {/* 分组标题 */}
          <div className="flex items-center gap-3 sticky top-28 bg-paper/95 backdrop-blur-sm py-2 z-10">
            <div className="px-3 py-1 rounded bg-cinnabar/10 flex items-center justify-center whitespace-nowrap">
              <span className="text-cinnabar font-bold text-sm">
                {group}
              </span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-ink-pale/30 to-transparent" />
            <span className="text-xs text-ink-light whitespace-nowrap">{groupSongs.length} 首</span>
          </div>

          {/* 歌曲卡片网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {groupSongs.map((song, index) => {
              const isVisible = visibleSongs.has(song.id);
              const isFav = favorites.includes(song.id);
              const commentCount = getCommentCount(song.id);

              return (
                <div
                  key={song.id}
                  ref={setSongRef(song.id)}
                  data-song-id={song.id}
                  onClick={() => onSelectSong(song)}
                  className={`group relative p-4 rounded-lg border border-ink-pale/20 bg-paper-light cursor-pointer
                    hover:border-cinnabar/30 hover:shadow-paper transition-all duration-300
                    ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ 
                    transitionDelay: `${(index % 8) * 50}ms`,
                  }}
                >
                  {/* 歌曲名 */}
                  <h3 className="font-medium text-ink group-hover:text-cinnabar transition-colors truncate pr-8">
                    {song.name}
                  </h3>

                  {/* 元信息 */}
                  <div className="flex items-center gap-2 mt-2 text-xs text-ink-light flex-wrap">
                    {song.album && (
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <Disc className="w-3 h-3" />
                        {song.album}
                      </span>
                    )}
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <Calendar className="w-3 h-3" />
                      {song.year_only}
                    </span>
                  </div>

                  {/* 收藏按钮 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(song.id);
                    }}
                    className={`absolute top-3 right-3 p-1.5 rounded transition-all ${
                      isFav 
                        ? 'text-cinnabar bg-cinnabar/10' 
                        : 'text-ink-pale hover:text-cinnabar hover:bg-cinnabar/5'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                  </button>

                  {/* 评论数 */}
                  {commentCount > 0 && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs text-ink-light">
                      <MessageCircle className="w-3 h-3" />
                      <span>{commentCount}</span>
                    </div>
                  )}

                  {/* 悬停指示 */}
                  <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-4 h-4 text-cinnabar" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
