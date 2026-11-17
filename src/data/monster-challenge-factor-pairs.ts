import { bilingual, type ChallengeEncounter, type ChallengeOption, type ChallengeStep, type ChoiceKey } from './monster-challenge-types';

type LocalizedPair = readonly [en: string, zh: string];

const answer = (en: string, zh = en): ChallengeOption => ({ text: bilingual(en, zh) });
const distractor = (en: string, zh: string, hint: LocalizedPair): ChallengeOption => ({
  text: bilingual(en, zh),
  hint: bilingual(...hint),
});

function step(
  prompt: LocalizedPair,
  correct: ChoiceKey,
  [A, B, C]: readonly [ChallengeOption, ChallengeOption, ChallengeOption],
  explanation: LocalizedPair,
  unlocked: LocalizedPair = explanation,
): ChallengeStep {
  return { prompt: bilingual(...prompt), options: { A, B, C }, correct, explanation: bilingual(...explanation), unlocked: bilingual(...unlocked) };
}

export const factorPairEncounters: readonly ChallengeEncounter[] = [
  {
    sourceId: '2001Q2',
    monster: bilingual('Duo', '配对兽'),
    title: bilingual('Match a product and a sum', '用积列因数对，再检查和'),
    stem: bilingual(
      'I’m thinking of two whole numbers. Their product is 24 and their sum is 11. What is the larger number?',
      '我想了两个非负整数。它们的积是 24，和是 11。较大的数是多少？',
    ),
    steps: [
      step(['Which search uses both clues?', '哪种找法能用上两个条件？'], 'B', [
        distractor('Find factor pairs of 11', '列出 11 的因数对', ['Eleven is the required sum. Which number is the product?', '11 是两数的和。哪个数才是积？']),
        answer('List factor pairs of 24 and check their sums', '列出 24 的因数对，再检查每对的和'),
        distractor('Find a pair whose difference is 11', '找一对相差 11 的数', ['The clue gives a sum. Compare a + b with 11.', '题目给的是和。应该把 a + b 与 11 比较。']),
      ], ['A positive product forces both whole numbers to be positive. Check the factor pairs (1,24), (2,12), (3,8), and (4,6).', '积是正数，所以这两个非负整数都是正整数。检查因数对 (1,24)、(2,12)、(3,8)、(4,6)。'], ['Factor pairs: (1,24), (2,12), (3,8), (4,6).', '因数对：(1,24)、(2,12)、(3,8)、(4,6)。']),
      step(['Which factor pair adds to 11?', '哪一对因数相加得 11？'], 'C', [
        distractor('(2,12)', '(2,12)', ['Check the sum: 2 + 12 = 14.', '检查和：2 + 12 = 14。']),
        distractor('(4,6)', '(4,6)', ['Check the sum: 4 + 6 = 10.', '检查和：4 + 6 = 10。']),
        answer('(3,8)'),
      ], ['The four sums are 25, 14, 11, and 10. Only (3,8) meets both conditions.', '四对的和分别是 25、14、11、10。只有 (3,8) 满足两个条件。'], ['The two numbers are 3 and 8.', '两个数是 3 和 8。']),
      step(['Which of the two numbers is larger?', '两个数中较大的是多少？'], 'A', [
        answer('8'),
        distractor('3', '3', ['Three is in the right pair, but it is the smaller number.', '3 是正确数对中的一个，但它是较小的数。']),
        distractor('12', '12', ['With 12, the other number would be 2. Their sum is 14.', '如果一个数是 12，另一个就是 2。两数和为 14。']),
      ], ['In the pair (3,8), the larger number is 8.', '因数对 (3,8) 中较大的数是 8。']),
    ],
  },
  {
    sourceId: '2006Q10',
    monster: bilingual('Plotter', '坐标兽'),
    title: bilingual('Plot ordered factor pairs', '把有序因数对画成点'),
    stem: bilingual(
      'Jorge’s teacher asks him to plot all the ordered pairs (w,l) of positive integers in which w is the width and l is the length of a rectangle with area 12. What should his graph look like?',
      '老师让 Jorge 画出所有符合条件的正整数有序数对 (w,l)：w 是长方形的宽，l 是长，面积为 12。他应该画出哪幅图？',
    ),
    figure: {
      source: 'questions/2006Q10.webp',
      description: bilingual('Five plots of length versus width. A falls steeply and then flattens. B rises along a line. C falls along a line. D is horizontal. E is vertical.', '五幅以宽为横轴、长为纵轴的图。A 的点先陡降、后趋平；B 的点沿直线上升；C 的点沿直线下降；D 的点排成水平线；E 的点排成竖直线。'),
    },
    steps: [
      step(['Which equation must every plotted pair satisfy?', '每个要画出的数对必须满足哪个等式？'], 'C', [
        distractor('w + l = 12', 'w + l = 12', ['The area of a rectangle is the product of its dimensions.', '长方形面积是长与宽的乘积。']),
        distractor('2(w + l) = 12', '2(w + l) = 12', ['That formula measures perimeter. The number 12 is an area.', '这是周长公式。题目中的 12 是面积。']),
        answer('w × l = 12'),
      ], ['A rectangle has area w × l. Both coordinates of every point are positive integers with product 12.', '长方形的面积为 w × l。每个点的两个坐标都是积为 12 的正整数。'], ['Area: w × l = 12.', '面积：w × l = 12。']),
      step(['Which list contains all possible widths?', '哪一列包含所有可能的宽？'], 'A', [
        answer('1, 2, 3, 4, 6, 12'),
        distractor('1, 2, 3', '1, 2, 3', ['(1,12) and (12,1) plot as two distinct points. Include both orders.', '(1,12) 与 (12,1) 是两个不同的点。要考虑两个顺序。']),
        distractor('1, 2, 3, 4, 5, 6', '1, 2, 3, 4, 5, 6', ['Test w = 5. Is the corresponding length 12/5 an integer?', '试试 w = 5。对应的长 12/5 是整数吗？']),
      ], ['Each positive factor of 12 can be a width. The points are (1,12), (2,6), (3,4), (4,3), (6,2), and (12,1).', '12 的每个正因数都可以作宽。六个点为 (1,12)、(2,6)、(3,4)、(4,3)、(6,2)、(12,1)。'], ['(1,12), (2,6), (3,4), (4,3), (6,2), (12,1)', '(1,12)、(2,6)、(3,4)、(4,3)、(6,2)、(12,1)']),
      step(['What happens to l as w increases?', 'w 增大时，l 怎样变化？'], 'B', [
        distractor('It increases', '不断增大', ['Compare l = 12 at w = 1 with l = 6 at w = 2.', '比较 w = 1 时的 l = 12 和 w = 2 时的 l = 6。']),
        answer('It decreases, but the points do not form a straight line', '逐渐减小，但这些点不在一条直线上'),
        distractor('It decreases along a straight line', '沿一条直线下降', ['For equal width increases from 1 to 2 and 2 to 3, the length drops by different amounts.', '宽从 1 增至 2、再从 2 增至 3 时，增量相同，但长的减少量不同。']),
      ], ['As w increases from 1 to 2 to 3, l drops from 12 to 6 to 4. The drops of 6 and 2 for equal width increases show that the points are not collinear.', 'w 从 1 增至 2 再增至 3 时，l 从 12 降至 6 再降至 4。宽每次都增 1，长却分别减 6 和 2，所以这些点不共线。'], ['The points descend and are not collinear.', '点从左上往右下分布，且不共线。']),
      step(['Which of the original graphs matches these points?', '原题中的哪幅图符合这些点的分布？'], 'C', [
        distractor('Graph B', '图 B', ['Graph B rises. Increasing the width must decrease the length to keep the same area.', '图 B 的点向右上方排列。面积不变时，增大宽需要减小长。']),
        distractor('Graph C', '图 C', ['Graph C descends on one straight line. The points (1,12), (2,6), and (3,4) have unequal slopes between neighbors.', '图 C 的点排成一条直线。(1,12)、(2,6)、(3,4) 相邻两点连线的斜率却不同。']),
        answer('Graph A', '图 A'),
      ], ['Graph A has the six decreasing, noncollinear points with the required widths and lengths.', '图 A 中的六个点随宽增大而下降，并且不共线，符合题意。']),
    ],
  },
  {
    sourceId: '2007Q10',
    monster: bilingual('Boxi', '方框兽'),
    title: bilingual('Apply a factor-sum rule twice', '从内到外求两次因数和'),
    stem: bilingual(
      'For each positive integer n, a box around n means the sum of its positive factors. For example, a box around 6 means 1 + 2 + 3 + 6 = 12. What is the value of 11 inside two nested boxes?',
      '对每个正整数 n，在 n 外面画一个方框，表示 n 的所有正因数之和。例如，6 外面加一层方框等于 1 + 2 + 3 + 6 = 12。11 外面套两层方框，结果是多少？',
    ),
    steps: [
      step(['What is the value of the inner box around 11?', '内层方框里的 11 经运算后等于多少？'], 'A', [
        answer('12'),
        distractor('2', '2', ['Two is the count of the factors 1 and 11. The rule asks for their sum.', '2 是因数 1 和 11 的个数。题目要求把它们相加。']),
        distractor('11', '11', ['A prime number still has 1 as a positive factor in addition to itself.', '质数除了它本身以外，还有正因数 1。']),
      ], ['The integer 11 is prime, so the inner box equals 1 + 11 = 12.', '11 是质数，所以内层方框等于 1 + 11 = 12。'], ['The inner box gives 12.', '内层方框的值是 12。']),
      step(['Which positive factors go into the sum for the outer box?', '外层方框要求把哪些正因数相加？'], 'C', [
        distractor('1, 11', '1、11', ['That was the inner box. The outer box now uses 12 as its input.', '这是内层的运算。外层方框的输入已经是 12。']),
        distractor('1, 2, 3, 12', '1、2、3、12', ['Complete both sides of the pairs 2 × 6 and 3 × 4.', '补全 2 × 6 和 3 × 4 两对因数。']),
        answer('1, 2, 3, 4, 6, 12', '1、2、3、4、6、12'),
      ], ['Pair the factors of 12 as (1,12), (2,6), and (3,4).', '把 12 的因数配成 (1,12)、(2,6)、(3,4)。'], ['Outer sum: 1 + 2 + 3 + 4 + 6 + 12.', '外层的和：1 + 2 + 3 + 4 + 6 + 12。']),
      step(['What is the value of the two nested boxes?', '两层方框的最终结果是多少？'], 'B', [
        distractor('13', '13', ['Thirteen only adds the pair (1,12). Include the other two pairs.', '13 只加了 (1,12) 这对。还有两对要加上。']),
        answer('28'),
        distractor('24', '24', ['Check your sum by grouping: (1 + 12) + (2 + 6) + (3 + 4).', '把和分组后重算：(1 + 12) + (2 + 6) + (3 + 4)。']),
      ], ['The three pairs contribute 13, 8, and 7, for a total of 28.', '三对因数的和分别为 13、8、7，总和为 28。']),
    ],
  },
  {
    sourceId: '2016Q7',
    monster: bilingual('Square', '平方兽'),
    title: bilingual('Check the parity of prime exponents', '用质因数指数的奇偶性判断完全平方数'),
    stem: bilingual(
      'Which of these numbers is not a perfect square: 1^{2016}, 2^{2017}, 3^{2018}, 4^{2019}, or 5^{2020}?',
      '在 1^{2016}、2^{2017}、3^{2018}、4^{2019}、5^{2020} 中，哪个不是完全平方数？',
    ),
    steps: [
      step(['What must be true in the prime factorization of a perfect square?', '完全平方数的质因数分解必须满足什么条件？'], 'C', [
        distractor('The number must be even', '这个数必须是偶数', ['Try 3² = 9. The relevant parity is in the exponents.', '看看 3² = 9。相关的是指数的奇偶性。']),
        distractor('At least one prime exponent is even', '至少有一个质因数的指数是偶数', ['In 12 = 2² × 3, the factor 3 is unpaired even though the 2s form a pair.', '在 12 = 2² × 3 中，两个 2 能配对，但还有一个 3 无法配对。']),
        answer('Every prime exponent is even', '每个质因数的指数都是偶数'),
      ], ['Multiplying an integer by itself doubles each prime exponent. The number 1 is also a square, since 1 = 1².', '一个整数乘以自身时，每个质因数的指数都会加倍。1 也是平方数，因为 1 = 1²。'], ['A square has even prime exponents.', '平方数的质因数指数全为偶数。']),
      step(['How can you write 4^{2019} as a power of 2?', '怎样把 4^{2019} 写成 2 的幂？'], 'B', [
        distractor('2^{2019}', '2^{2019}', ['Every factor of 4 contains two factors of 2.', '每个因数 4 都提供两个因数 2。']),
        answer('2^{4038}'),
        distractor('2^{2021}', '2^{2021}', ['When raising a power to a power, multiply the exponents.', '幂的乘方应把指数相乘。']),
      ], ['Since 4 = 2², (2²)^{2019} = 2^{4038}. Its prime exponent is even.', '因为 4 = 2²，所以 (2²)^{2019} = 2^{4038}，质因数的指数是偶数。'], ['4^{2019} = 2^{4038} is a square.', '4^{2019} = 2^{4038} 是一个平方数。']),
      step(['Which number is not a perfect square?', '哪个数不是完全平方数？'], 'A', [
        answer('2^{2017}'),
        distractor('3^{2018}', '3^{2018}', ['The exponent 2018 is even, so the factors of 3 pair up.', '2018 是偶数，每个因数 3 都能配到另一个 3。']),
        distractor('4^{2019}', '4^{2019}', ['The base 4 is itself a square. Rewrite it as a power of 2 before checking parity.', '底数 4 本身就是平方数。先把它写成 2 的幂，再检查指数奇偶。']),
      ], ['The powers 3^{2018} and 5^{2020} have even prime exponents. So does 4^{2019}, and 1^{2016} = 1. Only 2^{2017} has an odd prime exponent.', '3^{2018} 和 5^{2020} 的质因数指数为偶数，4^{2019} 也是，且 1^{2016} = 1。只有 2^{2017} 的质因数指数为奇数。']),
    ],
  },
  {
    sourceId: '2024Q4',
    monster: bilingual('Skip', '跳格兽'),
    title: bilingual('Find the square in a short interval', '在小范围内找平方数'),
    stem: bilingual(
      'When Yunji added all the integers from 1 to 9, she mistakenly left out a number. Her incorrect sum turned out to be a square number. Which number did Yunji leave out?',
      'Yunji 把 1 到 9 的整数相加时漏掉了一个数，算出的和恰好是平方数。她漏掉了哪个数？',
    ),
    steps: [
      step(['What is the sum before leaving out a number?', '不漏数时，1 到 9 的和是多少？'], 'A', [
        answer('45'),
        distractor('40', '40', ['Four pairs add to 10 each. The middle number 5 is still left to add.', '四对数各加成 10。还要加上中间的 5。']),
        distractor('50', '50', ['Pair the outside numbers inward. After four pairs, only 5 remains.', '从两头向中间配对。得到四对之后，只剩下一个 5。']),
      ], ['Pair 1 + 9, 2 + 8, 3 + 7, and 4 + 6. Add the remaining 5 to get 45.', '把 1 + 9、2 + 8、3 + 7、4 + 6 配成四对，再加剩下的 5，得到 45。'], ['Full sum: 45.', '完整的和是 45。']),
      step(['What range contains the incomplete sum?', '漏掉一个数后的和落在哪个范围？'], 'B', [
        distractor('35 through 44', '35 到 44', ['The largest allowed subtraction is 9, so the smallest incomplete sum is 45 − 9.', '最多只能减去 9，因此最小的和是 45 − 9。']),
        answer('36 through 44', '36 到 44'),
        distractor('36 through 45', '36 到 45', ['At least 1 must be left out. The incomplete sum cannot still equal 45.', '至少漏掉 1，所以剩下的和不可能仍是 45。']),
      ], ['Omitting the largest number gives 45 − 9 = 36. Omitting the smallest gives 45 − 1 = 44.', '漏掉最大的 9 得 45 − 9 = 36，漏掉最小的 1 得 45 − 1 = 44。'], ['The incomplete sum is between 36 and 44, inclusive.', '漏掉一个数后的和在 36 到 44 之间，包括端点。']),
      step(['Which perfect square is in that range?', '这个范围内的完全平方数是多少？'], 'C', [
        distractor('25', '25', ['25 = 5², but the smallest possible incomplete sum is 36.', '25 = 5²，但是漏数后的和最小是 36。']),
        distractor('49', '49', ['49 = 7², which is even larger than the full sum of 45.', '49 = 7²，比没漏数时的和 45 还大。']),
        answer('36'),
      ], ['The consecutive squares 5² = 25, 6² = 36, and 7² = 49 leave only 36 in the range.', '连续三个平方数是 5² = 25、6² = 36、7² = 49，只有 36 在范围内。'], ['Incomplete sum: 36.', '漏数后的和是 36。']),
      step(['What number was left out?', '漏掉的数是多少？'], 'C', [
        distractor('8', '8', ['Leaving out 8 gives 37. Compare that with the square 36.', '漏掉 8 会得到 37。题目中的平方数是 36。']),
        distractor('6', '6', ['Six is the square root of 36. To find what was left out, compare the two sums.', '6 是 36 的平方根。要找漏掉的数，应比较前后的两个和。']),
        answer('9'),
      ], ['The omitted number is 45 − 36 = 9.', '漏掉的数是 45 − 36 = 9。']),
    ],
  },
  {
    sourceId: '2009Q17',
    monster: bilingual('Parity', '指数兽'),
    title: bilingual('Complete prime exponents', '补齐质因数的指数'),
    stem: bilingual(
      'Let x be the smallest positive integer for which 360 × x is a perfect square, and y the smallest positive integer for which 360 × y is a perfect cube. What is x + y?',
      '使 360 × x 成为完全平方数的最小正整数是 x，使 360 × y 成为完全立方数的最小正整数是 y。x + y 等于多少？',
    ),
    steps: [
      step(['Which is the prime factorization of 360?', '360 的质因数分解是哪一个？'], 'B', [
        distractor('2³ × 3 × 5', '2³ × 3 × 5', ['The 9 in 360 = 36 × 10 gives two factors of 3.', '360 = 36 × 10，其中的 9 提供两个因数 3。']),
        answer('2³ × 3² × 5'),
        distractor('2² × 3² × 5', '2² × 3² × 5', ['36 gives two factors of 2, and 10 contributes one more.', '36 提供两个因数 2，10 还提供一个。']),
      ], ['Factor 360 as (2² × 3²) × (2 × 5) = 2³ × 3² × 5.', '把 360 写成 (2² × 3²) × (2 × 5)，得 2³ × 3² × 5。'], ['360 = 2³ × 3² × 5.', '360 = 2³ × 3² × 5。']),
      step(['Which is the smallest multiplier x that makes a square?', '使乘积成为平方数的最小乘数 x 是多少？'], 'A', [
        answer('10'),
        distractor('2', '2', ['That makes the exponent of 2 even but leaves the exponent of 5 odd.', '这样只把 2 的指数变为偶数，5 的指数仍为奇数。']),
        distractor('30', '30', ['The exponent of 3 is 2 already. Multiplying by another 3 would make it odd.', '3 的指数已经是 2。再乘一个 3 会把指数变成奇数。']),
      ], ['Increase the odd exponents of 2 and 5 by one. Leave the exponent of 3 alone. Thus x = 2 × 5 = 10.', '把 2 和 5 的奇数指数各加 1，3 的指数不用变。因此 x = 2 × 5 = 10。'], ['Square multiplier: x = 10.', '平方数所需乘数：x = 10。']),
      step(['Which is the smallest multiplier y that makes a cube?', '使乘积成为立方数的最小乘数 y 是多少？'], 'C', [
        distractor('15', '15', ['One extra 5 would bring its exponent to 2. For a cube, raise that exponent to 3.', '再乘一个 5 只能把 5 的指数变成 2。立方数需要把它补到 3。']),
        distractor('150', '150', ['The exponent of 2 is already a multiple of 3. Multiplying by another 2 would spoil it.', '2 的指数已经是 3 的倍数。再乘一个 2 会破坏这个条件。']),
        answer('75'),
      ], ['The exponent of 2 is already 3. Add one 3 and two 5s so the other exponents are also 3. Then y = 3 × 5² = 75.', '2 的指数已经是 3。再补一个 3 和两个 5，使另外两个指数也变成 3。于是 y = 3 × 5² = 75。'], ['Cube multiplier: y = 75.', '立方数所需乘数：y = 75。']),
      step(['What is x + y?', 'x + y 等于多少？'], 'B', [
        distractor('80', '80', ['Add the square multiplier 10 to the cube multiplier 75.', '把平方数所需乘数 10 与立方数所需乘数 75 相加。']),
        answer('85'),
        distractor('165', '165', ['Sum only the smallest multipliers, 10 and 75.', '只把两个最小乘数 10 和 75 相加。']),
      ], ['The required sum is 10 + 75 = 85.', '所求的和是 10 + 75 = 85。']),
    ],
  },
  {
    sourceId: '2018Q18',
    monster: bilingual('Branches', '分枝兽'),
    title: bilingual('Count divisors by exponent choices', '用指数选择数计算因数个数'),
    stem: bilingual('How many positive factors does 23,232 have?', '23,232 有多少个正因数？'),
    steps: [
      step(['Which is the complete prime factorization of 23,232?', '23,232 的完整质因数分解是哪一个？'], 'C', [
        distractor('2⁵ × 3 × 11²', '2⁵ × 3 × 11²', ['After dividing by 11² = 121, the quotient is 192 = 64 × 3.', '除以 11² = 121 后，商是 192 = 64 × 3。']),
        distractor('2⁶ × 3 × 11', '2⁶ × 3 × 11', ['Dividing once by 11 gives 2112, which is still a multiple of 11.', '除以 11 一次得到 2112，它仍是 11 的倍数。']),
        answer('2⁶ × 3 × 11²'),
      ], ['Since 23,232 = 121 × 192, factor 121 = 11² and 192 = 2⁶ × 3.', '由于 23,232 = 121 × 192，分别分解 121 = 11² 和 192 = 2⁶ × 3。'], ['23,232 = 2⁶ × 3 × 11².', '23,232 = 2⁶ × 3 × 11²。']),
      step(['How many exponent choices are there for 2, 3, and 11, respectively?', '2、3、11 的指数分别有多少种选法？'], 'A', [
        answer('7, 2, 3', '7、2、3'),
        distractor('6, 1, 2', '6、1、2', ['Zero is a choice for each exponent. It means that the corresponding prime is absent.', '每个指数都可以取 0，表示不选这个质因数。']),
        distractor('7, 1, 3', '7、1、3', ['The prime 3 may be included once or left out, so it has two choices.', '质因数 3 可以选一次，也可以不选，因此有两种选法。']),
      ], ['The exponent of 2 ranges from 0 to 6, that of 3 from 0 to 1, and that of 11 from 0 to 2. This gives 7, 2, and 3 choices.', '2 的指数可取 0 到 6，3 的指数可取 0 或 1，11 的指数可取 0 到 2。因此分别有 7、2、3 种选法。'], ['Choice counts: 7, 2, and 3.', '选法数：7、2、3。']),
      step(['How many positive factors does 23,232 have?', '23,232 一共有多少个正因数？'], 'C', [
        distractor('12', '12', ['Each choice for 2 can be combined with every choice for 3 and 11. Multiply the counts.', '每种 2 的指数都能与 3 和 11 的每种指数组合。应把选法数相乘。']),
        distractor('36', '36', ['The exponent of 2 can be 0 through 6, which gives seven choices.', '2 的指数从 0 到 6，一共有七种选法。']),
        answer('42'),
      ], ['Every exponent triple gives a distinct divisor. The count is 7 × 2 × 3 = 42.', '每组指数对应一个不同的因数，所以共有 7 × 2 × 3 = 42 个。']),
    ],
  },
  {
    sourceId: '2020Q17',
    monster: bilingual('Sieve', '筛选兽'),
    title: bilingual('Exclude the divisors with few factors', '排除因数个数较少的数'),
    stem: bilingual(
      'How many factors of 2020 have more than 3 factors? For example, 12 has 6 factors: 1, 2, 3, 4, 6, and 12.',
      '2020 的正因数中，有多少个数本身有超过 3 个正因数？例如，12 有 6 个正因数：1、2、3、4、6、12。',
    ),
    steps: [
      step(['First, how many positive factors does 2020 have altogether?', '先求 2020 一共有多少个正因数。'], 'B', [
        distractor('6', '6', ['In 2020 = 2² × 5 × 101, each of 5 and 101 may be included or omitted.', '2020 = 2² × 5 × 101，其中 5 和 101 都可以选或不选。']),
        answer('12'),
        distractor('16', '16', ['The exponent of 2 can be 0, 1, or 2. That gives three choices, not four.', '2 的指数可以取 0、1、2，一共有三种选法。']),
      ], ['Since 2020 = 2² × 5 × 101, choose one exponent for each prime. The total is 3 × 2 × 2 = 12.', '因为 2020 = 2² × 5 × 101，给每个质因数选指数，得到 3 × 2 × 2 = 12 个因数。'], ['There are 12 positive factors in all.', '共有 12 个正因数。']),
      step(['Which numbers have at most three positive factors?', '哪些数的正因数个数不超过三个？'], 'C', [
        distractor('Only primes', '只有质数', ['Include 1, which has one factor, and think about p² with factors 1, p, p².', '还要包括只有一个因数的 1，再想想只有 1、p、p² 三个因数的 p²。']),
        distractor('1, primes, and products of two different primes', '1、质数和两个不同质数的积', ['If p and q differ, pq has four factors: 1, p, q, pq.', '如果 p 和 q 是不同质数，那么 pq 有 1、p、q、pq 四个因数。']),
        answer('1, primes, and squares of primes', '1、质数和质数的平方'),
      ], ['A number with two distinct prime factors has at least four factors. A prime power p^k has k + 1 factors, so only k = 1 or 2 can qualify.', '含两个不同质因数的数至少有四个因数。质数幂 p^k 有 k + 1 个因数，所以只可能取 k = 1 或 2，另外还要考虑 1。'], ['Exclude 1, all primes, and prime squares.', '排除 1、质数和质数的平方。']),
      step(['How many divisors of 2020 should be excluded?', '2020 的正因数中应排除多少个？'], 'A', [
        answer('5'),
        distractor('4', '4', ['Include the prime square 2² = 4 as well as 1 and the three primes.', '除了 1 和三个质数，还要排除质数的平方 2² = 4。']),
        distractor('7', '7', ['Neither 5² nor 101² divides 2020. Their exponents in 2020 are only 1.', '5² 和 101² 都不能整除 2020，因为它们的质数指数在 2020 中都只有 1。']),
      ], ['The exclusions are 1, the primes 2, 5, and 101, and the prime square 4. There are five.', '要排除 1、质数 2、5、101，以及质数的平方 4，一共有五个。'], ['Exclude 1, 2, 5, 101, and 4.', '排除 1、2、5、101、4。']),
      step(['How many factors of 2020 have more than three factors?', '2020 有多少个因数本身有超过三个因数？'], 'B', [
        distractor('5', '5', ['Five is the count you remove. Subtract it from the total of 12.', '5 是被排除的个数，要从总数 12 中减去。']),
        answer('7'),
        distractor('8', '8', ['Do not forget to remove 1, which has only one positive factor.', '别忘了排除 1。1 只有一个正因数。']),
      ], ['After excluding the five cases, 12 − 5 = 7 factors remain.', '排除五种情况后，还剩 12 − 5 = 7 个因数。']),
    ],
  },
  {
    sourceId: '2015Q22',
    monster: bilingual('File', '排队兽'),
    title: bilingual('Count equal-row arrangements', '用因数个数计算等长排法'),
    stem: bilingual(
      'On June 1, a group of students stands in rows of 15. On June 2, the same group forms one long row. On June 3, there is one student in each row. On June 4, there are 6 students per row. They use a different number of students per row each day through June 12. On June 13, they cannot find a new arrangement. What is the smallest possible number of students?',
      '6 月 1 日，一群学生按每排 15 人站队。6 月 2 日，他们站成一长排。6 月 3 日，每排只有 1 人。6 月 4 日，每排 6 人。到 6 月 12 日为止，每天的每排人数都不同。6 月 13 日，他们找不到新的排法。最少可能有多少名学生？',
    ),
    steps: [
      step(['What does one possible number of students per row represent?', '一种可行的每排人数对应总人数的什么数？'], 'A', [
        answer('A positive divisor; there are exactly 12 divisors', '一个正因数，总人数恰有 12 个正因数'),
        distractor('A positive divisor; there are exactly 13 divisors', '一个正因数，总人数恰有 13 个正因数', ['They can find arrangements through June 12. June 13 contributes no new divisor.', '到 6 月 12 日为止都能找到新排法。6 月 13 日没有新的因数。']),
        distractor('A multiple of the total', '总人数的倍数', ['The total equals students per row multiplied by the number of rows.', '总人数等于每排人数乘以排数。']),
      ], ['For each positive divisor d of the total, d students per row gives an equal-row arrangement. The group found exactly 12.', '总人数的每个正因数 d 都对应一种每排 d 人的排法。题目中恰好找到了 12 种。'], ['The total has exactly 12 positive divisors.', '总人数恰有 12 个正因数。']),
      step(['What is the least common multiple of 15 and 6?', '15 和 6 的最小公倍数是多少？'], 'C', [
        distractor('21', '21', ['Adding 6 and 15 does not ensure that both numbers divide the total.', '把 6 和 15 相加，并不能确保它们都能整除总人数。']),
        distractor('90', '90', ['Multiplying 6 by 15 counts their shared factor 3 twice. Use the least common multiple.', '6 与 15 相乘，把共有因数 3 算了两次。应找最小公倍数。']),
        answer('30'),
      ], ['The total is divisible by 15 and 6. Their least common multiple is 2 × 3 × 5 = 30.', '总人数能被 15 和 6 整除。两者的最小公倍数是 2 × 3 × 5 = 30。'], ['Check multiples of 30 in increasing order.', '从小到大检查 30 的倍数。']),
      step(['How many positive divisors does the first candidate, 30, have?', '第一个候选数 30 有多少个正因数？'], 'B', [
        distractor('6', '6', ['For each of three primes, choose whether to include it. Multiply the three choice counts.', '三个质因数各有选或不选两种可能，应把三种选法数相乘。']),
        answer('8'),
        distractor('12', '12', ['In 30 = 2 × 3 × 5, each prime has exponent 1. Each divisor uses exponent 0 or 1.', '30 = 2 × 3 × 5，每个质因数的指数都是 1。因数中每个指数只能取 0 或 1。']),
      ], ['The factorization 30 = 2 × 3 × 5 gives 2 × 2 × 2 = 8 divisors, fewer than required.', '30 = 2 × 3 × 5，因数个数是 2 × 2 × 2 = 8，少于所需的 12 个。'], ['30 has only 8 divisors. Check 60 next.', '30 只有 8 个因数，接着检查 60。']),
      step(['Which is the smallest possible group size?', '人数最少可能是多少？'], 'A', [
        answer('60'),
        distractor('90', '90', ['Ninety has 12 divisors, but check 60 = 2² × 3 × 5 before choosing it.', '90 有 12 个因数，但在选它之前要检查更小的 60 = 2² × 3 × 5。']),
        distractor('30', '30', ['Thirty meets the multiple condition but has only eight divisors.', '30 符合公倍数条件，但只有八个因数。']),
      ], ['60 = 2² × 3 × 5 has 3 × 2 × 2 = 12 divisors. The only smaller positive multiple, 30, fails, so 60 is the minimum.', '60 = 2² × 3 × 5，有 3 × 2 × 2 = 12 个因数。唯一更小的正倍数 30 不符合条件，所以最少有 60 人。']),
    ],
  },
  {
    sourceId: '2018Q25',
    monster: bilingual('Cubix', '立方兽'),
    title: bilingual('Count integer cube roots', '数出范围内的整数立方根'),
    stem: bilingual('How many perfect cubes lie between 2⁸ + 1 and 2¹⁸ + 1, inclusive?', '从 2⁸ + 1 到 2¹⁸ + 1（包括端点），有多少个完全立方数？'),
    steps: [
      step(['What is the smallest integer cube root that qualifies?', '符合条件的最小整数立方根是多少？'], 'C', [
        distractor('6', '6', ['6³ = 216, which is below the lower endpoint 2⁸ + 1 = 257.', '6³ = 216，小于下限 2⁸ + 1 = 257。']),
        distractor('8', '8', ['Check 7³ before starting at 8. It equals 343.', '从 8 开始前，先检查 7³，它等于 343。']),
        answer('7'),
      ], ['Because 6³ = 216 < 257 < 343 = 7³, the first allowed root is 7.', '因为 6³ = 216 < 257 < 343 = 7³，所以最小符合条件的立方根是 7。'], ['Smallest root: 7.', '最小立方根：7。']),
      step(['What is the largest integer cube root that qualifies?', '符合条件的最大整数立方根是多少？'], 'B', [
        distractor('63', '63', ['2¹⁸ = (2⁶)³ already lies within the interval, one below the upper endpoint.', '2¹⁸ = (2⁶)³ 已经在范围内，恰好比上限小 1。']),
        answer('64'),
        distractor('65', '65', ['The upper endpoint is 64³ + 1. The next cube is more than 1 above 64³.', '上限是 64³ + 1。下一个立方数比 64³ 大得不止 1。']),
      ], ['2¹⁸ + 1 = 64³ + 1, which includes 64³ but is below 65³.', '2¹⁸ + 1 = 64³ + 1，所以包含 64³，但还不到 65³。'], ['Roots range from 7 through 64.', '立方根可取 7 到 64。']),
      step(['How many integer roots are there from 7 through 64, including both?', '从 7 到 64（包括两端）共有多少个整数立方根？'], 'A', [
        answer('58'),
        distractor('57', '57', ['64 − 7 counts the gaps between roots. Add one to count both ends.', '64 − 7 数的是相邻整数之间的间隔。两端都计入时还要加 1。']),
        distractor('64', '64', ['The roots 1 through 6 lie below the allowed range.', '立方根 1 到 6 都在允许范围之外。']),
      ], ['There is one cube for each integer root in the range. The count is 64 − 7 + 1 = 58.', '范围内的每个整数立方根对应一个立方数，因此共有 64 − 7 + 1 = 58 个。']),
    ],
  },
  {
    sourceId: '2025Q23',
    monster: bilingual('Twinline', '双生兽'),
    title: bilingual('Factor a square minus one', '用平方差分解质数乘积'),
    stem: bilingual(
      'How many four-digit numbers have all three properties? (I) The tens and ones digits are both 9. (II) The number is 1 less than a perfect square. (III) The number is the product of exactly two prime numbers.',
      '有多少个四位数同时满足以下三个条件？（I）十位和个位都是 9。（II）它比某个完全平方数小 1。（III）它恰好是两个质数的乘积。',
    ),
    steps: [
      step(['If N + 1 = k², what must be true of k?', '如果 N + 1 = k²，k 必须满足什么条件？'], 'B', [
        distractor('It must end in 9', '个位一定是 9', ['It is N that ends in 99. Adding one makes k² end in 00.', '末两位是 99 的是 N。加 1 后，k² 的末两位变成 00。']),
        answer('It must be a multiple of 10', '必须是 10 的倍数'),
        distractor('It only needs to be even', '只需要是偶数', ['The square has factors 2 and 5. Both must also divide its root.', '平方数含因数 2 和 5，平方根也必须同时被 2 和 5 整除。']),
      ], ['Since N ends in 99, k² = N + 1 ends in 00. Thus 2 and 5 both divide k, so 10 divides k.', '因为 N 的末两位是 99，k² = N + 1 的末两位是 00。因此 k 同时能被 2 和 5 整除，也就能被 10 整除。'], ['k is a multiple of 10.', 'k 是 10 的倍数。']),
      step(['Which values of k make k² − 1 a four-digit number?', '哪些 k 的值会使 k² − 1 是四位数？'], 'C', [
        distractor('30, 40, …, 100', '30、40、…、100', ['Check k = 30. Its square minus one is only 899.', '检查 k = 30，平方减 1 只有 899。']),
        distractor('40, 50, …, 90', '40、50、…、90', ['At k = 100, the square minus one is 9999, still four digits.', '当 k = 100 时，平方减 1 是 9999，仍是四位数。']),
        answer('40, 50, …, 100', '40、50、…、100'),
      ], ['Thirty is too small, 40² − 1 = 1599 qualifies, and 100² − 1 = 9999 is the largest possible. The seven roots are 40, 50, 60, 70, 80, 90, and 100.', '30 太小，40² − 1 = 1599 符合四位数条件，100² − 1 = 9999 是允许的最大值。候选根有 40、50、60、70、80、90、100 七个。'], ['Possible roots: 40, 50, 60, 70, 80, 90, 100.', '候选平方根：40、50、60、70、80、90、100。']),
      step(['Which factorization identifies the two candidates that both must be prime?', '哪种分解能得到两个都必须是质数的因数？'], 'A', [
        answer('(k − 1)(k + 1)'),
        distractor('(k − 1)²', '(k − 1)²', ['Expand: (k − 1)² has a −2k term. Use the difference of squares k² − 1².', '展开后会多出 −2k。应使用平方差 k² − 1²。']),
        distractor('k(k − 1)', 'k(k − 1)', ['That product is k² − k, so it subtracts k rather than 1.', '这个积是 k² − k，减掉的是 k。']),
      ], ['The difference of squares gives N = (k − 1)(k + 1). Both factors exceed 1, so a product of exactly two primes requires both factors to be prime.', '用平方差得 N = (k − 1)(k + 1)。这两个因数都大于 1，所以若 N 恰是两个质数的积，这两个因数都必须是质数。'], ['Both k − 1 and k + 1 must be prime.', 'k − 1 和 k + 1 都必须是质数。']),
      step(['Which is the complete list of qualifying prime pairs?', '所有满足条件的质数对是哪一组？'], 'B', [
        distractor('(49,51), (59,61)', '(49,51)、(59,61)', ['49 = 7² and 51 = 3 × 17, so the first pair cannot qualify.', '49 = 7²，51 = 3 × 17，第一对不符合条件。']),
        answer('(59,61) only', '只有 (59,61)'),
        distractor('(59,61), (89,91)', '(59,61)、(89,91)', ['Check 91 = 7 × 13. It is not prime.', '91 = 7 × 13，它不是质数。']),
      ], ['For roots 40, 50, 70, 80, 90 and 100, a composite neighbor is 39, 49, 69, 81, 91 and 99, respectively. For root 60, both neighbors 59 and 61 are prime.', '对于平方根 40、50、70、80、90、100，至少有一个相邻数是合数，分别是 39、49、69、81、91、99。平方根为 60 时，相邻的 59 和 61 都是质数。'], ['Only k = 60 works, giving N = 3599.', '只有 k = 60 符合条件，得到 N = 3599。']),
      step(['How many four-digit numbers have all three properties?', '有多少个四位数同时满足三个条件？'], 'C', [
        distractor('0', '0', ['Check 3599: it ends in 99, its successor is 60², and 3599 = 59 × 61.', '检查 3599：末两位为 99，下一数是 60²，且 3599 = 59 × 61。']),
        distractor('2', '2', ['59 and 61 give one product, regardless of their order.', '59 与 61 不论按哪个顺序相乘，都只得到同一个数。']),
        answer('1'),
      ], ['The only qualifying number is 59 × 61 = 3599, so the count is 1.', '唯一符合条件的数是 59 × 61 = 3599，所以共有 1 个。']),
    ],
  },
];
