import { bilingual, type ChallengeEncounter } from './monster-challenge-types';

export const fractionComparisonEncounters: readonly ChallengeEncounter[] = [
  {
    sourceId: '2000Q2',
    monster: bilingual('Flip', '翻翻'),
    title: bilingual('Compare a number with its reciprocal', '比较一个数和它的倒数'),
    stem: bilingual(
      'Which of these numbers is less than its reciprocal?\nOriginal choices: −2, −1, 0, 1, 2.',
      '下列哪个数小于它的倒数？\n原题选项：−2，−1，0，1，2。',
    ),
    steps: [
      {
        prompt: bilingual('How should you test the five numbers?', '该怎样检验这五个数？'),
        options: {
          A: {
            text: bilingual('Compare each number n with −n', '把每个数 n 与 −n 比较'),
            hint: bilingual('−n is the opposite of n. A nonzero number multiplied by its reciprocal gives 1.', '−n 是 n 的相反数。一个非零数乘以它的倒数，乘积是 1。'),
          },
          B: { text: bilingual('Compare each nonzero number n with 1/n', '把每个非零数 n 与 1/n 比较') },
          C: {
            text: bilingual('Use 0 as its own reciprocal and test all five', '把 0 当作它自己的倒数，再检验五个数'),
            hint: bilingual('Zero times any number is zero, so no number can multiply by zero to give 1.', '零乘任何数都等于零，因此找不到一个数乘以零得到 1。'),
          },
        },
        correct: 'B',
        explanation: bilingual('For nonzero n, its reciprocal is 1/n. Zero has no reciprocal because division by zero is undefined.', '非零数 n 的倒数是 1/n。除以零没有定义，所以零没有倒数。'),
        unlocked: bilingual('Test n < 1/n for n ≠ 0.', '对非零的 n，检验 n < 1/n。'),
      },
      {
        prompt: bilingual('Which three original choices can you rule out because the reciprocal is equal or undefined?', '哪三个原题选项可以排除，因为它们等于自己的倒数，或没有倒数？'),
        options: {
          A: {
            text: bilingual('−2, 0, and 2', '−2、0 和 2'),
            hint: bilingual('Zero is out, but the reciprocals of −2 and 2 have magnitude 1/2, different from 2.', '零可以排除；−2 和 2 的倒数的绝对值都是 1/2，与 2 不同。'),
          },
          B: {
            text: bilingual('−1, 1, and 2', '−1、1 和 2'),
            hint: bilingual('The reciprocals of −1 and 1 equal the original numbers. Compare 1/2 with 2, and remember that 1/0 is undefined.', '−1 和 1 分别等于自己的倒数。再比较 1/2 与 2，注意 1/0 没有定义。'),
          },
          C: { text: bilingual('−1, 0, and 1', '−1、0 和 1') },
        },
        correct: 'C',
        explanation: bilingual('The reciprocals of −1 and 1 are −1 and 1, respectively, so neither is strictly less. Zero has no reciprocal.', '−1 和 1 的倒数分别是 −1 和 1，因此都不满足严格小于的条件。零没有倒数。'),
        unlocked: bilingual('The remaining numbers to compare are −2 and 2.', '还要比较的两个数是 −2 和 2。'),
      },
      {
        prompt: bilingual('What are the reciprocals of −2 and 2, in that order?', '−2 和 2 的倒数分别是什么？'),
        options: {
          A: { text: bilingual('−1/2 and 1/2', '−1/2 和 1/2') },
          B: {
            text: bilingual('1/2 and −1/2', '1/2 和 −1/2'),
            hint: bilingual('For each pair, the signs must match so the product is positive 1.', '每个数与它的倒数同号，乘积才会等于正的 1。'),
          },
          C: {
            text: bilingual('−2 and 2', '−2 和 2'),
            hint: bilingual('Find 1 ÷ (−2) and 1 ÷ 2. Squaring either original number gives 4 instead of 1.', '分别计算 1 ÷ (−2) 和 1 ÷ 2。这两个原数各自平方都等于 4。'),
          },
        },
        correct: 'A',
        explanation: bilingual('(−2) × (−1/2) = 1 and 2 × (1/2) = 1, so the signs stay the same when you take a reciprocal.', '(−2) × (−1/2) = 1，2 × (1/2) = 1，因此取倒数时符号保持不变。'),
        unlocked: bilingual('Compare −2 with −1/2, and 2 with 1/2.', '比较 −2 与 −1/2，再比较 2 与 1/2。'),
      },
      {
        prompt: bilingual('Which original choice is less than its reciprocal?', '哪个原题选项小于它的倒数？'),
        options: {
          A: {
            text: bilingual('2', '2'),
            hint: bilingual('On the number line, 2 lies to the right of 1/2. The question asks for a number on the left of its reciprocal.', '在数轴上，2 在 1/2 的右边。题目要找的是位于自己倒数左边的数。'),
          },
          B: { text: bilingual('−2', '−2') },
          C: {
            text: bilingual('0', '0'),
            hint: bilingual('A reciprocal must multiply by the original number to give 1. Multiplying by 0 can never give 1.', '一个数与它的倒数相乘必须等于 1。零乘任何数都无法得到 1。'),
          },
        },
        correct: 'B',
        explanation: bilingual('−2 lies to the left of −1/2, so −2 < −1/2. The other remaining number satisfies 2 > 1/2.', '−2 位于 −1/2 左边，所以 −2 < −1/2。另一个候选数满足 2 > 1/2。'),
        unlocked: bilingual('−2 is less than its reciprocal.', '−2 小于它的倒数。'),
      },
    ],
  },
  {
    sourceId: '2019Q3',
    monster: bilingual('Overone', '盈一'),
    title: bilingual('Compare the parts above 1', '比较超过 1 的部分'),
    stem: bilingual(
      'Which of the following is the correct order of the fractions 15/11, 19/15, and 17/13, from least to greatest?',
      '把分数 15/11、19/15 和 17/13 从小到大排列，正确的顺序是什么？',
    ),
    steps: [
      {
        prompt: bilingual('What do you notice when you subtract each denominator from its numerator?', '分别用分子减去分母，会发现什么？'),
        options: {
          A: {
            text: bilingual('The differences are 4, 6, and 8', '三个差依次是 4、6、8'),
            hint: bilingual('Match each numerator with its own denominator. For the second fraction, calculate 19 − 15.', '每个分子要减去同一个分数里的分母。第二个分数应计算 19 − 15。'),
          },
          B: {
            text: bilingual('The differences are all 2', '三个差都是 2'),
            hint: bilingual('The denominators 11, 13, and 15 are spaced by 2 once sorted. Here the first subtraction is 15 − 11.', '分母 11、13、15 按大小排列后间隔是 2。这一步先计算 15 − 11。'),
          },
          C: { text: bilingual('The differences are all 4', '三个差都是 4') },
        },
        correct: 'C',
        explanation: bilingual('15 − 11 = 19 − 15 = 17 − 13 = 4. Each numerator equals its denominator plus 4.', '15 − 11 = 19 − 15 = 17 − 13 = 4。每个分子都比分母大 4。'),
        unlocked: bilingual('Every fraction has the form (denominator + 4) / denominator.', '三个分数都可以写成（分母 + 4）÷ 分母。'),
      },
      {
        prompt: bilingual('How can you split 15/11 into 1 plus a fraction?', '怎样把 15/11 拆成 1 加一个分数？'),
        options: {
          A: { text: bilingual('1 + 4/11', '1 + 4/11') },
          B: {
            text: bilingual('1 + 4/15', '1 + 4/15'),
            hint: bilingual('The denominator stays 11 when you split 15/11 into 11/11 and the leftover part.', '把 15/11 拆成 11/11 与剩余部分时，分母仍然是 11。'),
          },
          C: {
            text: bilingual('1 + 11/4', '1 + 11/4'),
            hint: bilingual('The leftover numerator is 4, and the whole was split into 11 equal parts.', '剩余的分子是 4，整体仍被分成 11 等份。'),
          },
        },
        correct: 'A',
        explanation: bilingual('15/11 = 11/11 + 4/11 = 1 + 4/11. The other fractions are 1 + 4/15 and 1 + 4/13.', '15/11 = 11/11 + 4/11 = 1 + 4/11。另两个分数分别是 1 + 4/15 和 1 + 4/13。'),
        unlocked: bilingual('Compare the parts above 1: 4/11, 4/15, and 4/13.', '接下来比较超过 1 的部分：4/11、4/15 和 4/13。'),
      },
      {
        prompt: bilingual('Which order puts these three parts above 1 from least to greatest?', '哪个选项把三个超过 1 的部分从小到大排好了？'),
        options: {
          A: {
            text: bilingual('4/11 < 4/13 < 4/15', '4/11 < 4/13 < 4/15'),
            hint: bilingual('If the same whole is divided into 15 equal parts rather than 11, each part is smaller. You are taking four parts either way.', '把同样大的整体分成 15 等份时，每份比分成 11 等份时小。两个分数都取四份。'),
          },
          B: { text: bilingual('4/15 < 4/13 < 4/11', '4/15 < 4/13 < 4/11') },
          C: {
            text: bilingual('4/13 < 4/15 < 4/11', '4/13 < 4/15 < 4/11'),
            hint: bilingual('Compare the first two denominators. A fifteenth of a whole is smaller than a thirteenth.', '比较前两个分数的分母。十五分之一比十三分之一小。'),
          },
        },
        correct: 'B',
        explanation: bilingual('With the same positive numerator, the fraction with a larger denominator is smaller. So 4/15 < 4/13 < 4/11.', '分子相同且为正数时，分母越大，分数越小。所以 4/15 < 4/13 < 4/11。'),
        unlocked: bilingual('The parts above 1 are ordered 4/15 < 4/13 < 4/11.', '超过 1 的部分按从小到大排列是 4/15 < 4/13 < 4/11。'),
      },
      {
        prompt: bilingual('Add 1 back to each part. What is the order of the original fractions?', '每个部分都加回 1。原来的三个分数应该怎样排列？'),
        options: {
          A: {
            text: bilingual('15/11 < 17/13 < 19/15', '15/11 < 17/13 < 19/15'),
            hint: bilingual('Adding the same amount to every number preserves the order. The smallest part above 1 is 4/15.', '给每个数加上相同的量，大小顺序不变。超过 1 最少的是 4/15。'),
          },
          B: {
            text: bilingual('19/15 < 15/11 < 17/13', '19/15 < 15/11 < 17/13'),
            hint: bilingual('The middle part is 4/13. Match it with the original fraction whose denominator is 13.', '中间的部分是 4/13。找出原题中分母是 13 的分数。'),
          },
          C: { text: bilingual('19/15 < 17/13 < 15/11', '19/15 < 17/13 < 15/11') },
        },
        correct: 'C',
        explanation: bilingual('Adding 1 to 4/15 < 4/13 < 4/11 keeps the inequality direction, giving 19/15 < 17/13 < 15/11.', '在 4/15 < 4/13 < 4/11 的每一项上加 1，不等号方向不变，得到 19/15 < 17/13 < 15/11。'),
        unlocked: bilingual('19/15 < 17/13 < 15/11', '19/15 < 17/13 < 15/11'),
      },
    ],
  },
  {
    sourceId: '2012Q20',
    monster: bilingual('Gapguard', '差距守卫'),
    title: bilingual('Compare the gaps below 1', '比较分数离 1 的差'),
    stem: bilingual(
      'What is the correct ordering of the three numbers 5/19, 7/21, and 9/23, in increasing order?',
      '把 5/19、7/21 和 9/23 从小到大排列，正确的顺序是什么？',
    ),
    steps: [
      {
        prompt: bilingual('How much larger is the denominator than the numerator in each fraction?', '每个分数的分母都比分子大多少？'),
        options: {
          A: { text: bilingual('14 in all three fractions', '三个分数的差都是 14') },
          B: {
            text: bilingual('2 in all three fractions', '三个分数的差都是 2'),
            hint: bilingual('The numerators rise by 2 from one fraction to the next. Look within the first fraction and calculate 19 − 5.', '相邻两个分数的分子增加了 2。这一步要在同一个分数内计算，例如 19 − 5。'),
          },
          C: {
            text: bilingual('24, 28, and 32, respectively', '差依次是 24、28、32'),
            hint: bilingual('Those are sums. To find how much larger the denominator is, subtract the numerator from it.', '这些是分子与分母的和。要找分母比分子大多少，应当用分母减分子。'),
          },
        },
        correct: 'A',
        explanation: bilingual('19 − 5 = 21 − 7 = 23 − 9 = 14. Each numerator is 14 less than its denominator.', '19 − 5 = 21 − 7 = 23 − 9 = 14。每个分子都比分母小 14。'),
        unlocked: bilingual('Each numerator equals its denominator minus 14.', '每个分子都等于分母减去 14。'),
      },
      {
        prompt: bilingual('How can you write 5/19 as 1 minus a fraction?', '怎样把 5/19 写成 1 减一个分数？'),
        options: {
          A: {
            text: bilingual('1 − 5/19', '1 − 5/19'),
            hint: bilingual('1 is 19/19. Taking away 5 nineteenths leaves 14 nineteenths. Find what you need to take away to leave 5 nineteenths.', '1 等于 19/19。减去十九分之五会剩下十九分之十四。想想应减去多少，才会剩下十九分之五。'),
          },
          B: {
            text: bilingual('1 − 14/5', '1 − 14/5'),
            hint: bilingual('Start with 19/19 and keep the denominator at 19 when you subtract.', '从 19/19 开始，减去的分数也应该以 19 为分母。'),
          },
          C: { text: bilingual('1 − 14/19', '1 − 14/19') },
        },
        correct: 'C',
        explanation: bilingual('5/19 = (19 − 14)/19 = 1 − 14/19. Likewise, 7/21 = 1 − 14/21 and 9/23 = 1 − 14/23.', '5/19 = (19 − 14)/19 = 1 − 14/19。同样，7/21 = 1 − 14/21，9/23 = 1 − 14/23。'),
        unlocked: bilingual('The gaps below 1 are 14/19, 14/21, and 14/23, respectively.', '这三个分数到 1 的差分别是 14/19、14/21 和 14/23。'),
      },
      {
        prompt: bilingual('What is the order of the gaps from greatest to least?', '这些差从大到小应该怎样排列？'),
        options: {
          A: {
            text: bilingual('14/23 > 14/21 > 14/19', '14/23 > 14/21 > 14/19'),
            hint: bilingual('When the same whole is divided into 23 parts instead of 19, each part is smaller. Both fractions take 14 of their parts.', '把同样大的整体分成 23 等份时，每份比分成 19 等份时小。这两个分数都取 14 份。'),
          },
          B: { text: bilingual('14/19 > 14/21 > 14/23', '14/19 > 14/21 > 14/23') },
          C: {
            text: bilingual('14/21 > 14/19 > 14/23', '14/21 > 14/19 > 14/23'),
            hint: bilingual('A nineteenth is larger than a twenty-first, so taking 14 nineteenths gives the larger gap.', '十九分之一比二十一分之一大，所以取 14 个十九分之一，得到的差更大。'),
          },
        },
        correct: 'B',
        explanation: bilingual('The positive numerators are equal to 14, so the smaller denominator gives the larger gap. Thus 14/19 > 14/21 > 14/23.', '分子都等于正数 14，分母越小，差越大。因此 14/19 > 14/21 > 14/23。'),
        unlocked: bilingual('Largest to smallest gap: 14/19 > 14/21 > 14/23.', '差从大到小排列：14/19 > 14/21 > 14/23。'),
      },
      {
        prompt: bilingual('When each gap is subtracted from 1, how does the order change?', '用 1 分别减去这些差时，大小顺序会怎样变化？'),
        options: {
          A: { text: bilingual('It reverses. The largest gap gives the smallest original fraction.', '顺序反过来。减去的差最大，得到的原分数最小。') },
          B: {
            text: bilingual('It stays the same. The largest gap gives the largest original fraction.', '顺序不变。减去的差最大，得到的原分数也最大。'),
            hint: bilingual('Start with the same 1 each time. Taking away more leaves less.', '每次都是从 1 开始。减去的量越多，剩下的就越少。'),
          },
          C: {
            text: bilingual('All three results become equal because they start at 1.', '因为都从 1 开始，所以三个结果相等。'),
            hint: bilingual('The starting value is the same, but the amounts you take away are different.', '起始值相同，但每次减去的量不同。'),
          },
        },
        correct: 'A',
        explanation: bilingual('Subtracting a larger gap leaves a smaller fraction, so 1 − 14/19 < 1 − 14/21 < 1 − 14/23.', '减去的差越大，剩下的分数越小，所以 1 − 14/19 < 1 − 14/21 < 1 − 14/23。'),
        unlocked: bilingual('Increasing fraction order comes from decreasing gap order.', '按差从大到小排列，对应的原分数就从小到大排列。'),
      },
      {
        prompt: bilingual('Which is the increasing order of the original fractions?', '原来的三个分数从小到大应该怎样排列？'),
        options: {
          A: {
            text: bilingual('9/23 < 7/21 < 5/19', '9/23 < 7/21 < 5/19'),
            hint: bilingual('9/23 has the smallest gap below 1. Taking away the least leaves the largest original fraction.', '9/23 到 1 的差最小。从 1 减去的量最少，剩下的原分数最大。'),
          },
          B: {
            text: bilingual('5/19 < 9/23 < 7/21', '5/19 < 9/23 < 7/21'),
            hint: bilingual('Between 14/21 and 14/23, 14/21 is larger. Subtracting it from 1 leaves less.', '14/21 比 14/23 大。从 1 减去 14/21 后，剩下的量较小。'),
          },
          C: { text: bilingual('5/19 < 7/21 < 9/23', '5/19 < 7/21 < 9/23') },
        },
        correct: 'C',
        explanation: bilingual('Replace 1 − 14/19, 1 − 14/21, and 1 − 14/23 by their original fractions to get 5/19 < 7/21 < 9/23.', '把 1 − 14/19、1 − 14/21 和 1 − 14/23 分别换回原来的分数，得到 5/19 < 7/21 < 9/23。'),
        unlocked: bilingual('5/19 < 7/21 < 9/23', '5/19 < 7/21 < 9/23'),
      },
    ],
  },
];
