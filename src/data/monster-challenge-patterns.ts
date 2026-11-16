import { bilingual, type ChallengeEncounter } from './monster-challenge-types';

export const patternEncounters: readonly ChallengeEncounter[] = [
  {
    sourceId: '2006Q9',
    monster: bilingual('Link', '链环兽'),
    title: bilingual('Cancel common factors in a long product', '在长连乘式中约去公因数'),
    stem: bilingual(
      'What is the product (3/2) × (4/3) × (5/4) × ⋯ × (2006/2005)?',
      '求乘积 (3/2) × (4/3) × (5/4) × ⋯ × (2006/2005)。',
    ),
    steps: [
      {
        prompt: bilingual('What is a good first move?', '先怎么处理这个连乘式？'),
        options: {
          A: {
            text: bilingual('Add the numerators and add the denominators', '分子相加，分母也相加'),
            hint: bilingual('The fractions are multiplied. Think of each numerator and denominator as a factor.', '这些分数是相乘的。把每个分子和分母看成乘积里的因数。'),
          },
          B: { text: bilingual('Write one fraction and cancel common factors', '写成一个大分数，再约去共有的因数') },
          C: {
            text: bilingual('Replace each fraction with the difference of its two numbers', '把每个分数换成分子减分母的差'),
            hint: bilingual('The fraction bar means division. Look for equal factors above and below it.', '分数线表示除法。找一找分子和分母中相同的因数。'),
          },
        },
        correct: 'B',
        explanation: bilingual('Multiply the numerators together and the denominators together to make one fraction.', '把各分子相乘作分子，各分母相乘作分母，写成一个分数。'),
        unlocked: bilingual('Top factors: 3 through 2006. Bottom factors: 2 through 2005.', '分子的因数从 3 到 2006，分母的因数从 2 到 2005。'),
      },
      {
        prompt: bilingual('Which entire range occurs both above and below the fraction bar?', '哪一段整数在分子和分母中都出现？'),
        options: {
          A: {
            text: bilingual('2 through 2005', '2 到 2005'),
            hint: bilingual('The top starts at 3. Does it contain a factor of 2 from the listed range?', '分子列出的第一个因数是 3。这一列里有单独的 2 吗？'),
          },
          B: {
            text: bilingual('3 through 2006', '3 到 2006'),
            hint: bilingual('The bottom stops at 2005. Find the last listed factor both rows share.', '分母只列到 2005。找出上下两列最后一个相同的因数。'),
          },
          C: { text: bilingual('3 through 2005', '3 到 2005') },
        },
        correct: 'C',
        explanation: bilingual('The two ranges overlap from 3 through 2005, so each of those matching factors cancels.', '两列从 3 到 2005 重叠，这些相同的因数都能一一约去。'),
        unlocked: bilingual('Cancel every listed factor from 3 through 2005.', '把 3 到 2005 的每个共有因数约去。'),
      },
      {
        prompt: bilingual('Which fraction is left after those cancellations?', '约去共有因数后，分数变成什么？'),
        options: {
          A: { text: bilingual('2006/2', '2006/2') },
          B: {
            text: bilingual('2006/2005', '2006/2005'),
            hint: bilingual('2005 occurs in both rows and cancels. Which bottom factor has no match?', '2005 在两列中都出现，已经约去了。分母还有哪个因数没有对应项？'),
          },
          C: {
            text: bilingual('2/2006', '2/2006'),
            hint: bilingual('Check the original ends. The 2 is below the fraction bar and the 2006 is above it.', '看看原式两端。2 在分母上，2006 在分子上。'),
          },
        },
        correct: 'A',
        explanation: bilingual('The only uncanceled factors are 2006 on top and 2 on the bottom.', '只剩分子上的 2006 和分母上的 2 没有约去。'),
        unlocked: bilingual('Remaining fraction: 2006/2.', '剩下的分数是 2006/2。'),
      },
      {
        prompt: bilingual('What is 2006 ÷ 2?', '2006 ÷ 2 等于多少？'),
        options: {
          A: {
            text: bilingual('1002', '1002'),
            hint: bilingual('Split 2006 into 2000 + 6 and halve each part.', '把 2006 拆成 2000 + 6，各除以 2。'),
          },
          B: { text: bilingual('1003', '1003') },
          C: {
            text: bilingual('2006', '2006'),
            hint: bilingual('The remaining denominator is 2, so divide the numerator by 2.', '分母还剩 2，所以要把分子除以 2。'),
          },
        },
        correct: 'B',
        explanation: bilingual('2006 ÷ 2 = 1000 + 3 = 1003.', '2006 ÷ 2 = 1000 + 3 = 1003。'),
        unlocked: bilingual('The product is 1003.', '乘积是 1003。'),
      },
    ],
  },
  {
    sourceId: '2013Q3',
    monster: bilingual('Pulse', '脉冲兽'),
    title: bilingual('Pair signed terms before multiplying', '先将带符号的项配对，再乘外面的数'),
    stem: bilingual(
      'What is the value of 4 × (−1 + 2 − 3 + 4 − 5 + 6 − 7 + ⋯ + 1000)?',
      '求 4 × (−1 + 2 − 3 + 4 − 5 + 6 − 7 + ⋯ + 1000) 的值。',
    ),
    steps: [
      {
        prompt: bilingual('Which setup makes the parentheses easier to evaluate?', '怎样整理括号里的各项，算起来更容易？'),
        options: {
          A: { text: bilingual('Group as (−1 + 2) + (−3 + 4) + ⋯', '分成 (−1 + 2) + (−3 + 4) + ⋯') },
          B: {
            text: bilingual('Group as (1 + 2) + (3 + 4) + ⋯', '分成 (1 + 2) + (3 + 4) + ⋯'),
            hint: bilingual('Keep the sign on each term when adding parentheses. Every odd term is negative.', '加括号时保留每一项的符号。题目里的奇数项都带负号。'),
          },
          C: {
            text: bilingual('Multiply just the first term by 4', '只把第一项乘以 4'),
            hint: bilingual('The 4 multiplies the whole sum. First simplify the sum inside the parentheses.', '4 乘的是括号内的整个和。先化简括号里的和。'),
          },
        },
        correct: 'A',
        explanation: bilingual('Pair each negative odd term with the positive even term right after it.', '把每个带负号的奇数项和它后面紧邻的正偶数项配对。'),
        unlocked: bilingual('The groups are (−1 + 2), (−3 + 4), …, (−999 + 1000).', '各组为 (−1 + 2)、(−3 + 4)、…、(−999 + 1000)。'),
      },
      {
        prompt: bilingual('What is the sum of each pair, such as −3 + 4?', '每组的和是多少？例如 −3 + 4。'),
        options: {
          A: {
            text: bilingual('−1', '−1'),
            hint: bilingual('In −3 + 4, the positive number is larger in magnitude by 1.', '−3 + 4 中，正数的绝对值比负数的绝对值大 1。'),
          },
          B: { text: bilingual('1', '1') },
          C: {
            text: bilingual('7', '7'),
            hint: bilingual('7 comes from 3 + 4. Keep the minus sign in −3 + 4.', '7 来自 3 + 4。请保留 −3 + 4 里的负号。'),
          },
        },
        correct: 'B',
        explanation: bilingual('Each positive even number is 1 more than the magnitude of its paired negative odd number.', '每组里正偶数都比相配的负奇数的绝对值大 1。'),
        unlocked: bilingual('Each pair sums to 1.', '每组的和都是 1。'),
      },
      {
        prompt: bilingual('There are 1000 terms. How many pairs of two terms are there?', '原式括号里有 1000 项。每两项一组，共有多少组？'),
        options: {
          A: {
            text: bilingual('1000', '1000'),
            hint: bilingual('1000 counts the individual terms. Put two terms in each group.', '1000 是单独的项数。每组有两项。'),
          },
          B: {
            text: bilingual('250', '250'),
            hint: bilingual('Each pair contains 2 terms. The outside multiplier 4 does not change the number of pairs.', '每组有 2 项。括号外的乘数 4 不影响组数。'),
          },
          C: { text: bilingual('500', '500') },
        },
        correct: 'C',
        explanation: bilingual('1000 ÷ 2 = 500 pairs. With 1 from each pair, the inner sum is 500.', '1000 ÷ 2 = 500，所以共有 500 组。每组的和是 1，括号里的和就是 500。'),
        unlocked: bilingual('Inside the parentheses: 500 × 1 = 500.', '括号里是 500 × 1 = 500。'),
      },
      {
        prompt: bilingual('Now apply the outside 4. What is the full expression worth?', '现在乘上括号外的 4。整个式子的值是多少？'),
        options: {
          A: { text: bilingual('2000', '2000') },
          B: {
            text: bilingual('500', '500'),
            hint: bilingual('500 is the value inside the parentheses. There is still a factor of 4 outside.', '500 是括号里的值。别忘了括号外还有乘数 4。'),
          },
          C: {
            text: bilingual('504', '504'),
            hint: bilingual('The 4 multiplies 500. It is not added to the sum.', '4 要乘以 500。这里不是相加。'),
          },
        },
        correct: 'A',
        explanation: bilingual('The full value is 4 × 500 = 2000.', '整个式子的值为 4 × 500 = 2000。'),
        unlocked: bilingual('The value is 2000.', '结果是 2000。'),
      },
    ],
  },
  {
    sourceId: '2016Q8',
    monster: bilingual('Twin', '双子兽'),
    title: bilingual('Pair descending even numbers', '将递减的偶数两两配对'),
    stem: bilingual(
      'Find the value of 100 − 98 + 96 − 94 + 92 − 90 + ⋯ + 8 − 6 + 4 − 2.',
      '求 100 − 98 + 96 − 94 + 92 − 90 + ⋯ + 8 − 6 + 4 − 2 的值。',
    ),
    steps: [
      {
        prompt: bilingual('Which grouping keeps the original signs?', '哪种配对保留了原式中各项的符号？'),
        options: {
          A: {
            text: bilingual('(100 + 98) + (96 + 94) + ⋯', '(100 + 98) + (96 + 94) + ⋯'),
            hint: bilingual('The 98 and 94 are subtracted in the original expression. Keep those signs.', '原式减去了 98 和 94。配对时保留这两个减号。'),
          },
          B: {
            text: bilingual('(98 − 100) + (94 − 96) + ⋯', '(98 − 100) + (94 − 96) + ⋯'),
            hint: bilingual('The first two signed terms are +100 and −98. Do not swap their signs.', '头两项是 +100 和 −98。不能把这两个数的符号互换。'),
          },
          C: { text: bilingual('(100 − 98) + (96 − 94) + ⋯', '(100 − 98) + (96 − 94) + ⋯') },
        },
        correct: 'C',
        explanation: bilingual('Group adjacent signed terms into differences, ending with (4 − 2).', '把相邻项配对，每组作差，最后一组是 (4 − 2)。'),
        unlocked: bilingual('Use (100 − 98) + (96 − 94) + ⋯ + (4 − 2).', '配成 (100 − 98) + (96 − 94) + ⋯ + (4 − 2)。'),
      },
      {
        prompt: bilingual('What is the value of each difference?', '每一组的差是多少？'),
        options: {
          A: { text: bilingual('2', '2') },
          B: {
            text: bilingual('−2', '−2'),
            hint: bilingual('In each pair the larger even number comes first, as in 96 − 94.', '每组都是较大的偶数在前，例如 96 − 94。'),
          },
          C: {
            text: bilingual('4', '4'),
            hint: bilingual('4 is the drop from 100 to 96 across two pairs. Find the gap within one pair.', '4 是从第一组的 100 到第二组的 96 的差。请看一组内部的差。'),
          },
        },
        correct: 'A',
        explanation: bilingual('Consecutive even numbers differ by 2, and each pair subtracts the smaller from the larger.', '相邻偶数相差 2，而且每组都是大数减小数。'),
        unlocked: bilingual('Each pair contributes 2.', '每组的差都是 2。'),
      },
      {
        prompt: bilingual('From 2 through 100 there are 100 ÷ 2 = 50 even numbers. How many pairs is that?', '从 2 到 100 有 100 ÷ 2 = 50 个偶数，可以组成多少对？'),
        options: {
          A: {
            text: bilingual('50', '50'),
            hint: bilingual('50 is the number of individual even numbers. Count two numbers per pair.', '50 是偶数的个数。每组要用两个偶数。'),
          },
          B: { text: bilingual('25', '25') },
          C: {
            text: bilingual('100', '100'),
            hint: bilingual('100 is the largest number in the expression. Start from the 50 even numbers, then pair them.', '100 是式子里最大的数。要从 50 个偶数出发，再两两配对。'),
          },
        },
        correct: 'B',
        explanation: bilingual('The 50 even numbers make 50 ÷ 2 = 25 pairs.', '50 个偶数两两配对，组成 50 ÷ 2 = 25 组。'),
        unlocked: bilingual('There are 25 pairs.', '一共有 25 组。'),
      },
      {
        prompt: bilingual('What is the total of 25 pairs worth 2 each?', '一共有 25 组，每组的值是 2。总和是多少？'),
        options: {
          A: {
            text: bilingual('25', '25'),
            hint: bilingual('25 counts the pairs. Each pair adds 2, so use 25 × 2.', '25 是组数。每组贡献 2，计算 25 × 2。'),
          },
          B: {
            text: bilingual('100', '100'),
            hint: bilingual('Multiply the 25 pairs by 2 per pair. Multiplying 50 by 2 counts each pair twice.', '用 25 组乘每组的 2。如果用 50 × 2，每组就被重复计算了。'),
          },
          C: { text: bilingual('50', '50') },
        },
        correct: 'C',
        explanation: bilingual('There are 25 pairs of value 2, giving 25 × 2 = 50.', '25 组各贡献 2，所以 25 × 2 = 50。'),
        unlocked: bilingual('The value is 50.', '结果是 50。'),
      },
    ],
  },
  {
    sourceId: '2017Q5',
    monster: bilingual('Factor', '因数兽'),
    title: bilingual('Simplify a product over a sum', '化简分子是积、分母是和的分数'),
    stem: bilingual(
      'What is the value of (1 × 2 × 3 × 4 × 5 × 6 × 7 × 8) / (1 + 2 + 3 + 4 + 5 + 6 + 7 + 8)?',
      '求 (1 × 2 × 3 × 4 × 5 × 6 × 7 × 8) / (1 + 2 + 3 + 4 + 5 + 6 + 7 + 8) 的值。',
    ),
    steps: [
      {
        prompt: bilingual('How can you simplify before multiplying the large numerator?', '分子里的乘积很大，怎样先化简？'),
        options: {
          A: {
            text: bilingual('Cancel each top factor with an equal bottom addend', '把分子的每个因数与分母相同的加数约去'),
            hint: bilingual('Cancellation works on factors of a whole expression. The bottom is still a sum.', '约分要约去整个式子的公因数。现在分母还是一个和。'),
          },
          B: { text: bilingual('Find the denominator, then look for matching factors', '先算出分母，再找分子中能约分的因数') },
          C: {
            text: bilingual('Treat the bottom as another product', '把分母也当成一个乘积'),
            hint: bilingual('The bottom signs are all +. Evaluate that sum before looking for factors.', '分母里全是加号。先算出和，再分解成因数。'),
          },
        },
        correct: 'B',
        explanation: bilingual('Evaluate the sum on the bottom. Then write that value as a product that matches some factors on top.', '先算分母的和，再把它写成与分子中若干因数对应的乘积。'),
        unlocked: bilingual('Start by adding the numbers 1 through 8.', '先把 1 到 8 的整数相加。'),
      },
      {
        prompt: bilingual('Pair the end terms: (1 + 8), (2 + 7), (3 + 6), and (4 + 5). What is the denominator?', '首尾配对：(1 + 8)、(2 + 7)、(3 + 6)、(4 + 5)。分母是多少？'),
        options: {
          A: {
            text: bilingual('32', '32'),
            hint: bilingual('The largest addend is 8, but each pair sums to 9. Count four pairs.', '最大的加数是 8，但每组的和是 9。共有 4 组。'),
          },
          B: {
            text: bilingual('72', '72'),
            hint: bilingual('There are 8 individual terms and only 4 pairs, each summing to 9.', '一共有 8 项，但只有 4 对，每对的和是 9。'),
          },
          C: { text: bilingual('36', '36') },
        },
        correct: 'C',
        explanation: bilingual('Each of the four pairs sums to 9, so the denominator is 4 × 9 = 36.', '四组各等于 9，所以分母为 4 × 9 = 36。'),
        unlocked: bilingual('Denominator: 36.', '分母等于 36。'),
      },
      {
        prompt: bilingual('Which three numerator factors multiply to the denominator 36?', '分子中哪三个因数的乘积恰好等于分母 36？'),
        options: {
          A: { text: bilingual('2 × 3 × 6', '2 × 3 × 6') },
          B: {
            text: bilingual('2 × 3 × 8', '2 × 3 × 8'),
            hint: bilingual('2 × 3 = 6. To reach 36, what should multiply that 6?', '2 × 3 = 6。要得到 36，还要乘哪个因数？'),
          },
          C: {
            text: bilingual('3 × 4 × 6', '3 × 4 × 6'),
            hint: bilingual('3 × 4 = 12, and 12 × 6 is 72. Look for a pair whose product is 6 before multiplying by 6.', '3 × 4 = 12，12 × 6 = 72。先找相乘得到 6 的两个数，再乘 6。'),
          },
        },
        correct: 'A',
        explanation: bilingual('36 = 2 × 3 × 6. Cancel those factors and the remaining product is 1 × 4 × 5 × 7 × 8.', '36 = 2 × 3 × 6。约去这三个因数，剩下 1 × 4 × 5 × 7 × 8。'),
        unlocked: bilingual('After canceling: 1 × 4 × 5 × 7 × 8.', '约分后剩下 1 × 4 × 5 × 7 × 8。'),
      },
      {
        prompt: bilingual('Group 4 × 5 = 20 and 7 × 8 = 56. What is 20 × 56?', '把 4 × 5 = 20 和 7 × 8 = 56 分别算好。20 × 56 等于多少？'),
        options: {
          A: {
            text: bilingual('112', '112'),
            hint: bilingual('112 is 2 × 56. Multiplying by 20 adds a factor of 10.', '112 是 2 × 56。乘 20 还要再乘 10。'),
          },
          B: {
            text: bilingual('2240', '2240'),
            hint: bilingual('A factor of 2 was already canceled. Calculate just 20 × 56.', '因数 2 已经约去。这里只算 20 × 56。'),
          },
          C: { text: bilingual('1120', '1120') },
        },
        correct: 'C',
        explanation: bilingual('20 × 56 = (2 × 56) × 10 = 1120.', '20 × 56 = (2 × 56) × 10 = 1120。'),
        unlocked: bilingual('The value is 1120.', '结果是 1120。'),
      },
    ],
  },
  {
    sourceId: '2018Q2',
    monster: bilingual('Cascade', '叠浪兽'),
    title: bilingual('Rewrite fractions before canceling', '先把每个因数写成一个分数，再约分'),
    stem: bilingual(
      'What is the value of (1 + 1/1) × (1 + 1/2) × (1 + 1/3) × (1 + 1/4) × (1 + 1/5) × (1 + 1/6)?',
      '求 (1 + 1/1) × (1 + 1/2) × (1 + 1/3) × (1 + 1/4) × (1 + 1/5) × (1 + 1/6) 的值。',
    ),
    steps: [
      {
        prompt: bilingual('What makes this product easier to simplify?', '怎样整理，能让这个乘积更容易化简？'),
        options: {
          A: { text: bilingual('Write each parenthesis as one fraction', '先把每个括号内的和写成一个分数') },
          B: {
            text: bilingual('Keep only the 1/1, 1/2, …, 1/6 and multiply those', '只保留 1/1、1/2、…、1/6，把它们相乘'),
            hint: bilingual('Each factor includes a whole 1 as well as a fraction. Combine both parts.', '每个因数里，分数前面还有一个完整的 1。要把两部分合起来。'),
          },
          C: {
            text: bilingual('Add the six parenthesized expressions', '把六个括号里的和再相加'),
            hint: bilingual('The six parentheses are connected by multiplication signs.', '这六个括号之间是乘号。'),
          },
        },
        correct: 'A',
        explanation: bilingual('In 1 + 1/n, write 1 as n/n. The factor becomes (n + 1)/n.', '在 1 + 1/n 中，把 1 写成 n/n，每个因数就成为 (n + 1)/n。'),
        unlocked: bilingual('Use 1 + 1/n = (n + 1)/n in each factor.', '每个因数可用 1 + 1/n = (n + 1)/n 改写。'),
      },
      {
        prompt: bilingual('Try the pattern on 1 + 1/4. Which fraction is it?', '用同样的方法改写 1 + 1/4，得到哪个分数？'),
        options: {
          A: {
            text: bilingual('2/4', '2/4'),
            hint: bilingual('A whole 1 equals 4/4. Add 1/4 to that.', '完整的 1 等于 4/4。再加上 1/4。'),
          },
          B: {
            text: bilingual('4/5', '4/5'),
            hint: bilingual('The denominator stays 4. Since 1 + 1/4 is larger than 1, its numerator is larger than 4.', '分母仍是 4。因为 1 + 1/4 大于 1，分子应大于 4。'),
          },
          C: { text: bilingual('5/4', '5/4') },
        },
        correct: 'C',
        explanation: bilingual('1 + 1/4 = 4/4 + 1/4 = 5/4. Apply the same rule to the other factors.', '1 + 1/4 = 4/4 + 1/4 = 5/4。其他因数也可以这样改写。'),
        unlocked: bilingual('The product is (2/1) × (3/2) × (4/3) × (5/4) × (6/5) × (7/6).', '乘积改写为 (2/1) × (3/2) × (4/3) × (5/4) × (6/5) × (7/6)。'),
      },
      {
        prompt: bilingual('Which range lists exactly the factors that appear in both the numerator and denominator?', '哪一段恰好是分子和分母中都出现的因数？'),
        options: {
          A: {
            text: bilingual('1 through 7', '1 到 7'),
            hint: bilingual('1 is listed only on the bottom, and 7 only on the top. Find the overlap.', '1 只列在分母，7 只列在分子。请找两列重叠的部分。'),
          },
          B: { text: bilingual('2 through 6', '2 到 6') },
          C: {
            text: bilingual('3 through 6', '3 到 6'),
            hint: bilingual('That range does cancel, but one smaller number appears in both (2/1) and (3/2).', '这几个数确实能约去，但 (2/1) 和 (3/2) 之间还有一个更小的相同因数。'),
          },
        },
        correct: 'B',
        explanation: bilingual('Every listed factor from 2 to 6 appears once above and once below. Cancel each of them.', '2 到 6 的每个因数都在分子和分母中各出现一次，可以全部约去。'),
        unlocked: bilingual('Only 7 on top and 1 on the bottom remain.', '分子只剩 7，分母只剩 1。'),
      },
      {
        prompt: bilingual('What is the value of the remaining fraction?', '剩下的分数等于多少？'),
        options: {
          A: { text: bilingual('7', '7') },
          B: {
            text: bilingual('7/6', '7/6'),
            hint: bilingual('6 cancels with the 6 above it. The remaining denominator is 1.', '分母的 6 已与分子的 6 约去。分母剩下的是 1。'),
          },
          C: {
            text: bilingual('1/7', '1/7'),
            hint: bilingual('The remaining 7 was a numerator, and 1 was a denominator.', '剩下的 7 在分子上，1 在分母上。'),
          },
        },
        correct: 'A',
        explanation: bilingual('The uncanceled product is 7/1 = 7.', '约分后得到 7/1 = 7。'),
        unlocked: bilingual('The product is 7.', '乘积是 7。'),
      },
    ],
  },
  {
    sourceId: '2018Q5',
    monster: bilingual('Oddtail', '单尾兽'),
    title: bilingual('Pair odd and even terms and keep the leftover', '奇偶项配对，保留落单项'),
    stem: bilingual(
      'What is the value of 1 + 3 + 5 + ⋯ + 2017 + 2019 − 2 − 4 − 6 − ⋯ − 2016 − 2018?',
      '求 1 + 3 + 5 + ⋯ + 2017 + 2019 − 2 − 4 − 6 − ⋯ − 2016 − 2018 的值。',
    ),
    steps: [
      {
        prompt: bilingual('Which rewrite uses every signed term once?', '哪一种改写把原式里每个带符号的项都用了一次？'),
        options: {
          A: {
            text: bilingual('(1 − 2) + (3 − 4) + ⋯ + (2017 − 2018)', '(1 − 2) + (3 − 4) + ⋯ + (2017 − 2018)'),
            hint: bilingual('Those pairs leave one odd number out. Check where 2019 appears.', '这样配对会漏掉一个奇数。看看 2019 有没有出现。'),
          },
          B: { text: bilingual('1 + (3 − 2) + (5 − 4) + ⋯ + (2019 − 2018)', '1 + (3 − 2) + (5 − 4) + ⋯ + (2019 − 2018)') },
          C: {
            text: bilingual('1 + 3 + 5 + ⋯ + 2019 − 2018', '1 + 3 + 5 + ⋯ + 2019 − 2018'),
            hint: bilingual('The original subtracts every even number from 2 through 2018. Include all those subtractions.', '原式减去了从 2 到 2018 的每个偶数。这些减项都要保留。'),
          },
        },
        correct: 'B',
        explanation: bilingual('Pair each subtracted even number with the next odd number. The initial 1 stays on its own.', '把每个被减去的偶数和它后面的奇数配对。开头的 1 单独保留。'),
        unlocked: bilingual('Keep the initial 1 and use pairs (3 − 2), (5 − 4), …, (2019 − 2018).', '保留开头的 1，再配成 (3 − 2)、(5 − 4)、…、(2019 − 2018)。'),
      },
      {
        prompt: bilingual('What does each pair, such as (5 − 4), add to the total?', '像 (5 − 4) 这样的每组差，对总和贡献多少？'),
        options: {
          A: {
            text: bilingual('0', '0'),
            hint: bilingual('The odd and even numbers are consecutive but unequal.', '奇数和偶数彼此相邻，但它们不相等。'),
          },
          B: {
            text: bilingual('−1', '−1'),
            hint: bilingual('Each pair subtracts the smaller even number from the larger odd number.', '每组都用较大的奇数减去较小的偶数。'),
          },
          C: { text: bilingual('1', '1') },
        },
        correct: 'C',
        explanation: bilingual('The odd number in each pair is one more than its even partner.', '每组中的奇数都比与它配对的偶数大 1。'),
        unlocked: bilingual('Every pair contributes 1.', '每组贡献 1。'),
      },
      {
        prompt: bilingual('There is one pair for each of 2, 4, …, 2018. How many pairs are there?', '2、4、…、2018 中的每个偶数都配成一组。一共有多少组？'),
        options: {
          A: { text: bilingual('1009', '1009') },
          B: {
            text: bilingual('1010', '1010'),
            hint: bilingual('The initial odd number 1 is a leftover. Count just the even partners, 2 through 2018.', '开头的奇数 1 是落单项。组数只数从 2 到 2018 的偶数。'),
          },
          C: {
            text: bilingual('2018', '2018'),
            hint: bilingual('The list skips the odd numbers. Divide 2018 by 2 to count the even numbers.', '数列跳过了所有奇数。用 2018 除以 2，数出偶数的个数。'),
          },
        },
        correct: 'A',
        explanation: bilingual('There are 2018 ÷ 2 = 1009 even numbers, and each makes one pair.', '2018 ÷ 2 = 1009，所以有 1009 个偶数，各组成一组。'),
        unlocked: bilingual('There are 1009 pairs plus the leftover 1.', '有 1009 组，另外还剩开头的 1。'),
      },
      {
        prompt: bilingual('What is the total including the unpaired 1?', '把落单的 1 也加进去，总和是多少？'),
        options: {
          A: {
            text: bilingual('1009', '1009'),
            hint: bilingual('1009 accounts for the pairs. Add the initial 1 as well.', '1009 只算了配好的各组。还要加上开头的 1。'),
          },
          B: { text: bilingual('1010', '1010') },
          C: {
            text: bilingual('1008', '1008'),
            hint: bilingual('The term left on its own is +1, so it raises the total by 1.', '落单的是 +1，所以总和应增加 1。'),
          },
        },
        correct: 'B',
        explanation: bilingual('The expression is 1 + 1009 × 1 = 1010.', '原式等于 1 + 1009 × 1 = 1010。'),
        unlocked: bilingual('The value is 1010.', '结果是 1010。'),
      },
    ],
  },
];
