import { bilingual, type ChallengeEncounter } from './monster-challenge-types';

const number = (value: string) => bilingual(value, value);

export const fractionBasicEncounters: readonly ChallengeEncounter[] = [
  {
    sourceId: '2012Q4',
    monster: bilingual('Crust', '脆饼'),
    title: bilingual('Compare a part with the whole', '用部分除以整体'),
    stem: bilingual(
      'Peter’s family ordered a 12-slice pizza for dinner. Peter ate one slice and shared another slice equally with his brother Paul. What fraction of the pizza did Peter eat?',
      'Peter 一家晚餐点了一个切成 12 片的披萨。Peter 吃了 1 片，又和兄弟 Paul 平分了另一片。Peter 吃了整个披萨的几分之几？',
    ),
    steps: [
      {
        prompt: bilingual('Which plan finds the fraction of the whole pizza Peter ate?', '用什么方法能求出 Peter 吃了整个披萨的几分之几？'),
        options: {
          A: { text: bilingual('Find how many slices Peter ate, then divide by 12', '先算 Peter 吃了几片，再除以 12') },
          B: { text: bilingual('Divide the slices Peter ate by 2, the number sharing', '把 Peter 吃的片数除以一起分披萨的 2 人'), hint: bilingual('Two people share one slice. To find a fraction of the whole pizza, use all 12 slices as the whole.', '两人只平分其中 1 片。求占整个披萨的比例时，要把全部 12 片看作整体。') },
          C: { text: bilingual('Count both slices as full slices Peter ate', '把两片都算成 Peter 吃的整片'), hint: bilingual('Peter ate one whole slice. He got only half of the slice he shared with Paul.', 'Peter 吃了 1 整片。和 Paul 平分的那一片，他只吃了一半。') },
        },
        correct: 'A',
        explanation: bilingual('Measure Peter’s portion in slices. Then compare that amount with the 12 slices in the whole pizza.', '先用片数表示 Peter 吃的量，再用它除以整个披萨的 12 片。'),
        unlocked: bilingual('Whole pizza = 12 slices. Peter’s share of the second slice = 1/2 slice.', '整个披萨有 12 片。第二片中，Peter 分到了 1/2 片。'),
      },
      {
        prompt: bilingual('How many slices did Peter eat altogether?', 'Peter 一共吃了几片？'),
        options: {
          A: { text: bilingual('1/2 slice', '1/2 片'), hint: bilingual('Half a slice is his part of the second slice. Include the whole slice he ate too.', '半片是 Peter 从第二片分到的量，还要加上他吃的那一整片。') },
          B: { text: bilingual('2 slices', '2 片'), hint: bilingual('Count only Peter’s half of the second slice.', '第二片只算 Peter 分到的那一半。') },
          C: { text: bilingual('3/2 slices', '3/2 片') },
        },
        correct: 'C',
        explanation: bilingual('The whole slice is 2/2 slices. Adding the half slice gives 2/2 + 1/2 = 3/2 slices.', '1 整片等于 2/2 片。再加上半片，得到 2/2 + 1/2 = 3/2 片。'),
        unlocked: bilingual('Peter ate 3/2 slices out of 12 slices.', '整个披萨有 12 片，Peter 吃了其中的 3/2 片。'),
      },
      {
        prompt: bilingual('What fraction of the whole pizza did Peter eat?', 'Peter 吃了整个披萨的几分之几？'),
        options: {
          A: { text: number('1/24'), hint: bilingual('1/24 is the fraction of the pizza in half of one slice. Add the whole slice Peter ate.', '1/24 只对应半片，还要算上 Peter 吃的那一整片。') },
          B: { text: number('1/8') },
          C: { text: number('1/6'), hint: bilingual('1/6 equals 2/12, or two full slices. Divide Peter’s actual 3/2 slices by 12.', '1/6 等于 2/12，表示两整片。Peter 实际吃了 3/2 片，用这个片数除以 12。') },
        },
        correct: 'B',
        explanation: bilingual('Divide the part by the whole: (3/2) ÷ 12 = 3/24 = 1/8.', '用部分除以整体：(3/2) ÷ 12 = 3/24 = 1/8。'),
        unlocked: bilingual('Peter ate 1/8 of the pizza.', 'Peter 吃了整个披萨的 1/8。'),
      },
    ],
  },
  {
    sourceId: '2024Q2',
    monster: bilingual('Ripple', '波波'),
    title: bilingual('Write the quotients as decimals', '把分数化成小数再相加'),
    stem: bilingual(
      'What is the value of this expression in decimal form?\n44/11 + 110/44 + 44/1100',
      '把下面算式的结果写成小数。\n44/11 + 110/44 + 44/1100',
    ),
    steps: [
      {
        prompt: bilingual('Which plan makes this sum easy to evaluate in decimal form?', '用什么方法可以方便地求出这个和的小数形式？'),
        options: {
          A: { text: bilingual('Add the numerators and add the denominators', '把分子相加，再把分母相加'), hint: bilingual('Adding fractions requires a common denominator or an equivalent representation such as decimals.', '分数相加可以先通分，也可以先化成小数。分母不能直接相加。') },
          B: { text: bilingual('Replace each denominator with 100 and keep its numerator', '把三个分母都换成 100，分子保持原样'), hint: bilingual('If you scale a denominator, scale its numerator by the same factor to keep the fraction’s value.', '分母乘或除以多少，分子也要乘或除以同一个数，分数的值才不变。') },
          C: { text: bilingual('Evaluate each quotient, then add the results', '先分别算出三个商，再把它们相加') },
        },
        correct: 'C',
        explanation: bilingual('Each fraction is a division. Start with 44/11 = 4, then evaluate the other two quotients.', '分数也表示除法。先算出 44/11 = 4，再求另外两个商。'),
        unlocked: number('44/11 = 4'),
      },
      {
        prompt: bilingual('Which decimal equals 110/44?', '110/44 等于哪个小数？'),
        options: {
          A: { text: number('2.5') },
          B: { text: number('0.25'), hint: bilingual('110 is larger than 44, so 110/44 is greater than 1. Divide both numbers by 22 to get 5/2.', '110 大于 44，所以 110/44 大于 1。分子和分母同时除以 22，可以得到 5/2。') },
          C: { text: number('2.05'), hint: bilingual('110/44 = 5/2 = 2 + 1/2. Convert the remaining half to tenths.', '110/44 = 5/2 = 2 + 1/2。把剩下的 1/2 化成十分之几。') },
        },
        correct: 'A',
        explanation: bilingual('Divide 110 and 44 by 22 to get 5/2, which equals 2.5.', '分子和分母同时除以 22，得到 5/2，也就是 2.5。'),
        unlocked: number('110/44 = 2.5'),
      },
      {
        prompt: bilingual('Which decimal equals 44/1100?', '44/1100 等于哪个小数？'),
        options: {
          A: { text: number('0.4'), hint: bilingual('Divide both numbers by 11. The result is 4/100, four hundredths.', '分子和分母同时除以 11，得到 4/100，也就是 4 个百分之一。') },
          B: { text: number('0.04') },
          C: { text: number('0.004'), hint: bilingual('Check the denominator: 1100 ÷ 11 = 100. Put the 4 in the hundredths place.', '检查分母：1100 ÷ 11 = 100。所以 4 应该放在百分位。') },
        },
        correct: 'B',
        explanation: bilingual('Divide 44 and 1100 by 11. The fraction becomes 4/100 = 0.04.', '分子和分母同时除以 11，得到 4/100 = 0.04。'),
        unlocked: number('44/1100 = 0.04'),
      },
      {
        prompt: bilingual('Line up the decimal points. What is 4 + 2.5 + 0.04?', '把小数点对齐。4 + 2.5 + 0.04 等于多少？'),
        options: {
          A: { text: number('6.54') },
          B: { text: number('6.9'), hint: bilingual('6.9 adds four tenths to 6.5. The last term is four hundredths.', '6.9 相当于把 0.4 加到 6.5 上。最后一项是 0.04，要加在百分位。') },
          C: { text: number('6.504'), hint: bilingual('The 4 in 0.04 goes in the hundredths place, immediately after the tenths digit 5.', '0.04 中的 4 在百分位，紧跟在十分位的 5 后面。') },
        },
        correct: 'A',
        explanation: bilingual('Write 4.00 + 2.50 + 0.04. The sum is 6.54.', '把算式写成 4.00 + 2.50 + 0.04，得到 6.54。'),
        unlocked: number('4.00 + 2.50 + 0.04 = 6.54'),
      },
    ],
  },
  {
    sourceId: '2005Q6',
    monster: bilingual('Digit', '数豆'),
    title: bilingual('Compare digits by place value', '逐位比较小数大小'),
    stem: bilingual(
      'Suppose d is a digit. For how many values of d is 2.00d5 > 2.005?',
      '设 d 是一个数字。能使 2.00d5 > 2.005 成立的 d 有多少个？',
    ),
    steps: [
      {
        prompt: bilingual('How should you line up the two decimals before comparing them?', '比较两个小数前，怎样把它们的数位对齐？'),
        options: {
          A: { text: bilingual('Rewrite 2.005 as 2.0005', '把 2.005 改写成 2.0005'), hint: bilingual('Inserting a zero before 5 moves the 5 to a different place. Put a zero at the right end instead.', '在 5 前面插入 0 会改变 5 的数位。可以在最右边添 0。') },
          B: { text: bilingual('Rewrite 2.005 as 2.0050 and compare from left to right', '把 2.005 写成 2.0050，再从左往右逐位比较') },
          C: { text: bilingual('Compare only the last digit of each written number', '只比较两个数写出来的最后一位'), hint: bilingual('The last digits shown in 2.00d5 and 2.005 sit in different places. Line up the decimal points first.', '2.00d5 和 2.005 写出来的最后一位不在同一个数位。先把小数点对齐。') },
        },
        correct: 'B',
        explanation: bilingual('Adding a zero at the end leaves the value unchanged, so compare 2.00d5 with 2.0050.', '在小数末尾添 0 不改变大小，所以可以比较 2.00d5 和 2.0050。'),
        unlocked: bilingual('Line up 2.00d5 and 2.0050.', '把 2.00d5 和 2.0050 按数位对齐。'),
      },
      {
        prompt: bilingual('At the first place that could differ, which digits do you compare?', '来到第一处可能不同的数位时，要比较哪两个数字？'),
        options: {
          A: { text: bilingual('d and 5 in the thousandths place', '千分位的 d 和 5') },
          B: { text: bilingual('5 and 0 in the ten-thousandths place', '万分位的 5 和 0'), hint: bilingual('Compare the thousandths digits d and 5 first. The final digits matter only if those digits tie.', '先比较千分位的 d 和 5。它们相等时，才比较最后一位。') },
          C: { text: bilingual('0 and 0 in the hundredths place', '百分位的 0 和 0'), hint: bilingual('The hundredths digits are always equal. Look one place to the right.', '百分位都一定是 0，要再向右看一位。') },
        },
        correct: 'A',
        explanation: bilingual('The digits to the left of the thousandths place match, so compare d with 5 first.', '千分位左边的数字都相同，所以先比较 d 和 5。'),
        unlocked: bilingual('If d > 5, the inequality holds. If d < 5, it fails. Check the tie d = 5 next.', 'd > 5 时不等式成立，d < 5 时不成立。接下来检查 d = 5 的情况。'),
      },
      {
        prompt: bilingual('If d = 5, how does 2.0055 compare with 2.0050?', '如果 d = 5，2.0055 和 2.0050 谁更大？'),
        options: {
          A: { text: bilingual('They are equal', '两数相等'), hint: bilingual('The numbers agree through the thousandths. Compare 5 and 0 in the next place.', '两数到千分位都相同，再比较下一位的 5 和 0。') },
          B: { text: bilingual('2.0055 is smaller', '2.0055 更小'), hint: bilingual('At the first differing place, the left number has 5 and the right number has 0.', '第一处不同的数位上，左边是 5，右边是 0。') },
          C: { text: bilingual('2.0055 is larger', '2.0055 更大') },
        },
        correct: 'C',
        explanation: bilingual('The thousandths tie, then 5 > 0 in the ten-thousandths place. So d = 5 works.', '千分位相同，但万分位有 5 > 0，所以 d = 5 也符合条件。'),
        unlocked: bilingual('The inequality holds when d = 5 or d > 5.', 'd = 5 或 d > 5 时，不等式成立。'),
      },
      {
        prompt: bilingual('How many digits d satisfy the inequality?', '有多少个数字 d 能使不等式成立？'),
        options: {
          A: { text: number('4'), hint: bilingual('Counting 6, 7, 8 and 9 gives four digits. Include d = 5 because its last digit wins the tie.', '6、7、8、9 一共是 4 个。d = 5 时，比较最后一位后也成立，所以要把 5 算进去。') },
          B: { text: number('5') },
          C: { text: number('6'), hint: bilingual('Start at 5 and stop at 9. A digit can be any integer from 0 through 9.', '从 5 开始数，到 9 为止。数字 d 只能是 0 到 9 之间的整数。') },
        },
        correct: 'B',
        explanation: bilingual('The valid digits are 5, 6, 7, 8 and 9. There are five of them.', '符合条件的数字是 5、6、7、8、9，共 5 个。'),
        unlocked: bilingual('Five digits work: 5, 6, 7, 8 and 9.', '共有 5 个数字符合条件：5、6、7、8、9。'),
      },
    ],
  },
];
