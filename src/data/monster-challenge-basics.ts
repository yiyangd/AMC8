import { bilingual, type ChallengeEncounter } from './monster-challenge-types';

const number = (value: string) => bilingual(value, value);

export const basicEncounters: readonly ChallengeEncounter[] = [
  {
    sourceId: '2006Q2',
    monster: bilingual('Dot', '点点'),
    title: bilingual('Apply the scoring rule', '按计分规则计算'),
    stem: bilingual(
      'On the AMC 8 contest Billy answers 13 questions correctly, answers 7 questions incorrectly and doesn’t answer the last 5. What is his score?\nIn this contest, a correct answer earns 1 point. A wrong answer or a blank earns 0 points.',
      'Billy 在 AMC 8 竞赛中答对了 13 题，答错了 7 题，最后 5 题没有作答。他得了多少分？\n本题采用 AMC 8 的计分规则。答对一题得 1 分，答错或不答得 0 分。',
    ),
    steps: [
      {
        prompt: bilingual('Which plan finds Billy’s score?', '怎样计算 Billy 的得分？'),
        options: {
          A: { text: bilingual('Count every question as one point', '每道题都记 1 分'), hint: bilingual('Only a correct answer earns a point.', '只有答对的题才得分。') },
          B: { text: bilingual('Find the points from each group of answers', '按计分规则算出每类题的得分') },
          C: { text: bilingual('Subtract one point for each wrong answer', '每答错一题扣 1 分'), hint: bilingual('A wrong answer earns zero points, so it contributes zero to the sum.', '答错一题得 0 分，所以错题对总分的贡献是 0。') },
        },
        correct: 'B',
        explanation: bilingual('Use 1 point per correct answer and 0 per wrong or blank answer.', '按每道对题 1 分、每道错题或空题 0 分计分。'),
        unlocked: bilingual('Correct answers earn 1 point each. Wrong and blank answers earn 0.', '对题每题 1 分，错题和空题每题 0 分。'),
      },
      {
        prompt: bilingual('How many points do the wrong answers and blanks earn altogether?', '错题和空题一共得了多少分？'),
        options: {
          A: { text: bilingual('0 points', '0 分') },
          B: { text: bilingual('7 points', '7 分'), hint: bilingual('There are 7 wrong answers, and each earns 0 points.', '有 7 道错题，每道得 0 分。') },
          C: { text: bilingual('12 points', '12 分'), hint: bilingual('12 counts all the wrong and blank questions. Multiply that count by 0 to get its points.', '12 是错题和空题的总数。这个题数乘 0 才是得分。') },
        },
        correct: 'A',
        explanation: bilingual('The wrong answers and blanks contribute 7 × 0 + 5 × 0 = 0.', '错题和空题的得分为 7 × 0 + 5 × 0 = 0。'),
        unlocked: bilingual('Wrong answers and blanks add 0 points.', '错题和空题一共得 0 分。'),
      },
      {
        prompt: bilingual('Billy answered 13 questions correctly. What is his total score?', 'Billy 答对了 13 道题。他的总分是多少？'),
        options: {
          A: { text: bilingual('6 points', '6 分'), hint: bilingual('Keep all the points from correct answers. Each wrong answer adds zero points.', '对题的得分都保留，错题加 0 分。') },
          B: { text: bilingual('26 points', '26 分'), hint: bilingual('Multiply 13 by 1, the points per correct answer.', '用答对的 13 题乘以每题的 1 分。') },
          C: { text: bilingual('13 points', '13 分') },
        },
        correct: 'C',
        explanation: bilingual('The total score is 13 × 1 + 7 × 0 + 5 × 0 = 13 points.', '总分是 13 × 1 + 7 × 0 + 5 × 0 = 13 分。'),
        unlocked: bilingual('Billy scored 13 points.', 'Billy 得了 13 分。'),
      },
    ],
  },
  {
    sourceId: '2010Q1',
    monster: bilingual('Acorn', '橡果'),
    title: bilingual('Combine three groups', '合计三个班的人数'),
    stem: bilingual(
      'At Euclid Middle School the mathematics teachers are Miss Germain, Mr. Newton, and Mrs. Young. There are 11 students in Miss Germain’s class, 8 students in Mr. Newton’s class, and 9 students in Mrs. Young’s class taking the AMC 8 Contest this year. How many mathematics students at Euclid Middle School are taking the contest?',
      'Euclid 中学的数学老师是 Germain 老师、Newton 老师和 Young 老师。今年三个班分别有 11 人、8 人和 9 人参加 AMC 8 竞赛。这所学校一共有多少名学生参赛？',
    ),
    steps: [
      {
        prompt: bilingual('Which plan counts everyone taking the contest?', '怎样数出所有参赛学生？'),
        options: {
          A: { text: bilingual('Add the three class counts', '把三个班的参赛人数相加') },
          B: { text: bilingual('Use only the largest class count', '只用人数最多的班的人数'), hint: bilingual('The two other classes also have students taking the contest.', '另外两个班也有学生参赛。') },
          C: { text: bilingual('Treat the three classes as the same size', '把三个班的参赛人数当成一样多'), hint: bilingual('Use 11, 8, and 9 as given. The three counts are different.', '按题目给出的 11、8、9 计算，三个数各不相同。') },
        },
        correct: 'A',
        explanation: bilingual('Find the total by adding 11, 8, and 9.', '把 11、8 和 9 相加，求出总人数。'),
        unlocked: bilingual('Add 11 + 8 + 9. A useful pair is 11 and 9.', '计算 11 + 8 + 9。可以先加 11 和 9。'),
      },
      {
        prompt: bilingual('What is 11 + 9?', '11 + 9 等于多少？'),
        options: {
          A: { text: number('19'), hint: bilingual('19 comes from adding 11 and 8. This pair uses 9.', '11 加 8 得 19。这一组加的是 9。') },
          B: { text: number('21'), hint: bilingual('Take 1 from 11 and add it to 9 to make two tens.', '从 11 中挪 1 给 9，正好得到两个 10。') },
          C: { text: number('20') },
        },
        correct: 'C',
        explanation: bilingual('Pair 11 and 9 to make 20.', '先把 11 和 9 凑成 20。'),
        unlocked: number('11 + 9 = 20'),
      },
      {
        prompt: bilingual('The two classes have 20 students altogether. Add the remaining 8. What is the total?', '两个班一共有 20 人，再加上另一个班的 8 人，总人数是多少？'),
        options: {
          A: { text: bilingual('20 students', '20 人'), hint: bilingual('20 covers two classes. Include the 8 students from Mr. Newton’s class.', '20 只包括两个班。还要加上 Newton 老师班里的 8 人。') },
          B: { text: bilingual('28 students', '28 人') },
          C: { text: bilingual('29 students', '29 人'), hint: bilingual('The 9 students were already used to make 20. Add 8 this time.', '9 人已经算在 20 人里，这一步加 8。') },
        },
        correct: 'B',
        explanation: bilingual('The total is (11 + 9) + 8 = 20 + 8 = 28 students.', '一共有 (11 + 9) + 8 = 20 + 8 = 28 人。'),
        unlocked: bilingual('28 students are taking the contest.', '共有 28 人参赛。'),
      },
    ],
  },
  {
    sourceId: '2017Q1',
    monster: bilingual('Spark', '火花'),
    title: bilingual('Evaluate before comparing', '先算出各式的值，再比较'),
    stem: bilingual(
      'Which of the following values is largest?\n(1) 2 + 0 + 1 + 7\n(2) 2 × 0 + 1 + 7\n(3) 2 + 0 × 1 + 7\n(4) 2 + 0 + 1 × 7\n(5) 2 × 0 × 1 × 7',
      '下列五个算式中，哪个值最大？\n(1) 2 + 0 + 1 + 7\n(2) 2 × 0 + 1 + 7\n(3) 2 + 0 × 1 + 7\n(4) 2 + 0 + 1 × 7\n(5) 2 × 0 × 1 × 7',
    ),
    steps: [
      {
        prompt: bilingual('How should you evaluate these expressions before comparing?', '比较大小之前，应该怎样计算这些算式？'),
        options: {
          A: { text: bilingual('Add before multiplying', '先加后乘'), hint: bilingual('With addition and multiplication together, evaluate each product first.', '算式中同时有加法和乘法时，先算乘法。') },
          B: { text: bilingual('Ignore every 0 wherever it appears', '一律跳过算式中的 0'), hint: bilingual('Adding zero keeps a number the same. Multiplying by zero changes the product to zero.', '加 0 时原数不变，乘 0 时积为 0。') },
          C: { text: bilingual('Multiply before adding', '先乘后加') },
        },
        correct: 'C',
        explanation: bilingual('Each multiplication is evaluated before the surrounding additions.', '先算各处的乘法，再算与这些乘积有关的加法。'),
        unlocked: bilingual('Calculate products first. The all-product expression (5) is 0.', '先乘后加。第 (5) 个算式全是乘法，乘积为 0。'),
      },
      {
        prompt: bilingual('What is expression (2), 2 × 0 + 1 + 7?', '第 (2) 个算式 2 × 0 + 1 + 7 的值是多少？'),
        options: {
          A: { text: number('8') },
          B: { text: number('0'), hint: bilingual('The product 2 × 0 is zero. The + 1 + 7 is still outside that product.', '2 × 0 等于 0，乘积之外还要加 1 和 7。') },
          C: { text: number('10'), hint: bilingual('Here the 2 is a factor in 2 × 0. It does not remain as a separate addend.', '这里的 2 是 2 × 0 的因数，先与 0 相乘。') },
        },
        correct: 'A',
        explanation: bilingual('First compute 2 × 0 = 0. Then add 1 and 7 to get 8.', '先算 2 × 0 = 0，再加 1 和 7，得到 8。'),
        unlocked: bilingual('Expression (2) is 8. Expression (5) is 0.', '第 (2) 式等于 8，第 (5) 式等于 0。'),
      },
      {
        prompt: bilingual('What happens when you evaluate expressions (3) and (4)?', '第 (3) 式和第 (4) 式算出来有什么关系？'),
        options: {
          A: { text: bilingual('(3) is larger', '第 (3) 式更大'), hint: bilingual('In (4), start with 1 × 7 = 7, then add 2 and 0.', '第 (4) 式先算 1 × 7 = 7，再加 2 和 0。') },
          B: { text: bilingual('Both equal 9', '两式都等于 9') },
          C: { text: bilingual('(4) is larger', '第 (4) 式更大'), hint: bilingual('In (3), 0 × 1 is zero, but the 2 and 7 are separate addends.', '第 (3) 式的 0 × 1 等于 0，另外还要加 2 和 7。') },
        },
        correct: 'B',
        explanation: bilingual('Expression (3) becomes 2 + 0 + 7. Expression (4) also becomes 2 + 0 + 7.', '第 (3) 式化为 2 + 0 + 7，第 (4) 式也化为 2 + 0 + 7。'),
        unlocked: bilingual('Expressions (3) and (4) both equal 9.', '第 (3) 式和第 (4) 式都等于 9。'),
      },
      {
        prompt: bilingual('Evaluate 2 + 0 + 1 + 7, then compare all five results. What is the largest value?', '算出 2 + 0 + 1 + 7，再比较五个结果。最大值是多少？'),
        options: {
          A: { text: number('9'), hint: bilingual('9 is the value of (3) and (4). Include the all-addition expression (1) in the comparison.', '9 是第 (3) 式和第 (4) 式的值。还要算出全是加法的第 (1) 式再比较。') },
          B: { text: number('8'), hint: bilingual('8 is the result of (2). Expressions (3) and (4) already give a larger value.', '8 是第 (2) 式的值，第 (3) 式和第 (4) 式的值都更大。') },
          C: { text: number('10') },
        },
        correct: 'C',
        explanation: bilingual('The five values are 10, 8, 9, 9, and 0. Expression (1) has the largest value, 10.', '五个结果为 10、8、9、9、0。第 (1) 式最大，值为 10。'),
        unlocked: bilingual('The largest value is 10, from 2 + 0 + 1 + 7.', '最大值是 10，由 2 + 0 + 1 + 7 得到。'),
      },
    ],
  },
  {
    sourceId: '2023Q1',
    monster: bilingual('Orbit', '轨道'),
    title: bilingual('Evaluate each group before subtracting', '先算两个括号，再相减'),
    stem: bilingual(
      'What is the value of (8 × 4 + 2) − (8 + 4 × 2)?',
      '(8 × 4 + 2) − (8 + 4 × 2) 的值是多少？',
    ),
    steps: [
      {
        prompt: bilingual('Which plan respects both parentheses and multiplication?', '怎样同时遵守括号和乘法的运算顺序？'),
        options: {
          A: { text: bilingual('Multiply inside each group, then evaluate the groups', '在每个括号内先乘后加') },
          B: { text: bilingual('Add first inside each group', '每个括号内先加再乘'), hint: bilingual('Parentheses separate the two groups. Inside each group, multiplication still comes before addition.', '括号把算式分成两组，每组内仍然先乘后加。') },
          C: { text: bilingual('Subtract the two 8s first', '先把两个 8 相减'), hint: bilingual('The outside minus sign subtracts the entire second group from the entire first group.', '括号外的减号表示第一个括号的值减去整个第二个括号的值。') },
        },
        correct: 'A',
        explanation: bilingual('Find each parenthesized value with multiplication first. Then subtract the second value from the first.', '每个括号内先算乘法，再算加法。最后用前一个括号的值减去后一个括号的值。'),
        unlocked: bilingual('The left group is 8 × 4 + 2. The right group is 8 + 4 × 2.', '左边算 8 × 4 + 2，右边算 8 + 4 × 2。'),
      },
      {
        prompt: bilingual('What is the value of the left group, 8 × 4 + 2?', '左边括号 8 × 4 + 2 的值是多少？'),
        options: {
          A: { text: number('48'), hint: bilingual('48 comes from 8 × (4 + 2). Here, multiply 8 × 4 before adding 2.', '48 来自 8 × (4 + 2)。这里先算 8 × 4，再加 2。') },
          B: { text: number('34') },
          C: { text: number('32'), hint: bilingual('32 is the value of 8 × 4. Now add the 2.', '32 是 8 × 4 的值。接下来还要加 2。') },
        },
        correct: 'B',
        explanation: bilingual('The left group equals 8 × 4 + 2 = 32 + 2 = 34.', '左边括号等于 8 × 4 + 2 = 32 + 2 = 34。'),
        unlocked: bilingual('The left group equals 34.', '左边括号的值是 34。'),
      },
      {
        prompt: bilingual('What is the value of the right group, 8 + 4 × 2?', '右边括号 8 + 4 × 2 的值是多少？'),
        options: {
          A: { text: number('24'), hint: bilingual('24 comes from (8 + 4) × 2. In this group, 4 × 2 comes first.', '24 来自 (8 + 4) × 2。这个括号里先算 4 × 2。') },
          B: { text: number('8'), hint: bilingual('8 is the product 4 × 2. Include the other 8 as an addend.', '8 是 4 × 2 的积，再加上算式开头的 8。') },
          C: { text: number('16') },
        },
        correct: 'C',
        explanation: bilingual('The right group equals 8 + 4 × 2 = 8 + 8 = 16.', '右边括号等于 8 + 4 × 2 = 8 + 8 = 16。'),
        unlocked: bilingual('The right group equals 16.', '右边括号的值是 16。'),
      },
      {
        prompt: bilingual('What is the value after subtracting the right group from the left group?', '用左边括号的值减去右边括号的值，结果是多少？'),
        options: {
          A: { text: number('18') },
          B: { text: number('−18'), hint: bilingual('Start with the left group, 34, and subtract the right group, 16.', '从左边括号的 34 开始，减去右边括号的 16。') },
          C: { text: number('50'), hint: bilingual('The sign between the groups is subtraction.', '两个括号之间是减号。') },
        },
        correct: 'A',
        explanation: bilingual('The expression equals 34 − 16 = 18.', '原式等于 34 − 16 = 18。'),
        unlocked: number('34 − 16 = 18'),
      },
    ],
  },
  {
    sourceId: '2026Q1',
    monster: bilingual('Triplet', '三叶'),
    title: bilingual('Group a repeating sign pattern', '按重复的加减号分组'),
    stem: bilingual(
      'What is the value of the following expression?\n1 + 2 − 3 + 4 + 5 − 6 + 7 + 8 − 9 + 10 + 11 − 12',
      '下面的算式等于多少？\n1 + 2 − 3 + 4 + 5 − 6 + 7 + 8 − 9 + 10 + 11 − 12',
    ),
    steps: [
      {
        prompt: bilingual('Which grouping follows the repeating signs?', '怎样分组能看出加减号的重复规律？'),
        options: {
          A: { text: bilingual('Use pairs with the same sign pattern', '每两项一组，让每组符号相同'), hint: bilingual('Compare the first two pairs. The first is +, + and the next is −, +.', '看看前两组。前两项是正、正，接下来两项是负、正。') },
          B: { text: bilingual('Use triples, with two additions and one subtraction', '每三项一组，两项加、一项减') },
          C: { text: bilingual('Add all twelve numbers as positive values', '把十二个数都按正数相加'), hint: bilingual('Keep the minus signs in front of 3, 6, 9, and 12 when you group.', '分组时保留 3、6、9、12 前面的减号。') },
        },
        correct: 'B',
        explanation: bilingual('The pattern is +, +, −. Group the terms as (1 + 2 − 3), (4 + 5 − 6), (7 + 8 − 9), and (10 + 11 − 12).', '符号按正、正、负重复，可分成 (1 + 2 − 3)、(4 + 5 − 6)、(7 + 8 − 9) 和 (10 + 11 − 12)。'),
        unlocked: bilingual('Group terms into four triples with the pattern +, +, −.', '按正、正、负分成四组，每组三项。'),
      },
      {
        prompt: bilingual('What is the value of the first triple, 1 + 2 − 3?', '第一组 1 + 2 − 3 的值是多少？'),
        options: {
          A: { text: number('3'), hint: bilingual('3 is the sum of 1 and 2. Subtract 3 to finish the group.', '1 加 2 得 3，再减去 3 才算完这一组。') },
          B: { text: number('6'), hint: bilingual('Keep the minus sign in front of the last 3.', '最后的 3 前面有减号。') },
          C: { text: number('0') },
        },
        correct: 'C',
        explanation: bilingual('The first triple gives (1 + 2) − 3 = 3 − 3 = 0.', '第一组是 (1 + 2) − 3 = 3 − 3 = 0。'),
        unlocked: bilingual('The first triple has value 0.', '第一组的值是 0。'),
      },
      {
        prompt: bilingual('Moving to the next triple adds 3 to each of its three numbers. By how much does the triple’s value increase?', '换到下一组时，三个数都增大 3。每组的计算结果比前一组大多少？'),
        options: {
          A: { text: number('9'), hint: bilingual('The first two numbers are added. The third number is subtracted.', '前两个数是加上的，第三个数是减掉的。') },
          B: { text: number('3') },
          C: { text: number('6'), hint: bilingual('Both addends contribute an increase of 3, and the subtracted number also increases by 3.', '两个加数各增大 3，被减掉的数也增大 3。') },
        },
        correct: 'B',
        explanation: bilingual('The new value increases by 3 + 3 − 3 = 3. Starting from 0, the four triple values are 0, 3, 6, and 9.', '每组的值增加 3 + 3 − 3 = 3。从 0 开始，四组的值依次是 0、3、6、9。'),
        unlocked: bilingual('The four triple values are 0, 3, 6, and 9.', '四组的值依次是 0、3、6、9。'),
      },
      {
        prompt: bilingual('What is the sum of the four triple values?', '四组的值相加，结果是多少？'),
        options: {
          A: { text: number('18') },
          B: { text: number('15'), hint: bilingual('Include the second triple’s value, 3, along with 6 and 9.', '除了 6 和 9，还要算上第二组的 3。') },
          C: { text: number('9'), hint: bilingual('9 is the value of the last triple. Add the four triple values together.', '9 是最后一组的值，还要把四组的值相加。') },
        },
        correct: 'A',
        explanation: bilingual('The original expression equals 0 + 3 + 6 + 9 = 18.', '原式等于 0 + 3 + 6 + 9 = 18。'),
        unlocked: number('0 + 3 + 6 + 9 = 18'),
      },
    ],
  },
  {
    sourceId: '2026Q2',
    monster: bilingual('Mosaic', '拼图'),
    title: bilingual('Count by layer and multiply', '分层计数后求和'),
    stem: bilingual(
      'In the array shown below, three 3s are surrounded by 2s, which are in turn surrounded by a border of 1s. What is the sum of the numbers in the array?',
      '下图中，三个 3 被一圈 2 围住，外面再围了一圈 1。图中所有数字的和是多少？',
    ),
    grid: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 2, 2, 2, 2, 2, 1],
      [1, 2, 3, 3, 3, 2, 1],
      [1, 2, 2, 2, 2, 2, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ],
    steps: [
      {
        prompt: bilingual('Which plan can find the sum using the layers?', '怎样利用每层的数字求和？'),
        options: {
          A: { text: bilingual('Count every cell as one', '每个格子都算 1'), hint: bilingual('Cells in the middle layers carry values of 2 and 3.', '中间两层的格子里的数是 2 或 3。') },
          B: { text: bilingual('Count each kind of number and multiply by its value', '分别数出每种数字，再乘以它的值') },
          C: { text: bilingual('Add 1, 2, and 3 once each', '1、2、3 各加一次'), hint: bilingual('Each number in the array contributes once for every cell in which it appears.', '每个数字出现几次，就要加几次。') },
        },
        correct: 'B',
        explanation: bilingual('Count the 1s, the 2s, and the 3s separately. Multiply each count by its value, then add.', '分别数出 1、2、3 的个数，用各自的个数乘以数字的值，再把三部分相加。'),
        unlocked: bilingual('Find the number of copies of 1, 2, and 3. The center has three 3s.', '分别求 1、2、3 的个数。中心有三个 3。'),
      },
      {
        prompt: bilingual('How many 1s are on the outer border?', '最外圈共有多少个 1？'),
        options: {
          A: { text: number('20') },
          B: { text: number('14'), hint: bilingual('The top and bottom rows make 14. Count the 1s along the two sides too.', '上下两行共有 14 个 1，还要数左右两边。') },
          C: { text: number('24'), hint: bilingual('If you count all four sides in full, you count each corner twice.', '四条边都从头数到尾，会把每个角各数两次。') },
        },
        correct: 'A',
        explanation: bilingual('There are 7 in each of the top and bottom rows. Each side has 3 more after excluding those corners. That gives 2 × 7 + 2 × 3 = 20.', '上下两行各有 7 个，左右两边去掉已数过的角后各有 3 个。一共是 2 × 7 + 2 × 3 = 20 个。'),
        unlocked: bilingual('The outer border has twenty 1s.', '最外圈有 20 个 1。'),
      },
      {
        prompt: bilingual('How many 2s are in the layer around the 3s?', '围着三个 3 的一圈里，共有多少个 2？'),
        options: {
          A: { text: number('15'), hint: bilingual('The inner rectangle has 15 cells in total. Exclude the three center 3s.', '内层长方形共有 15 格，要去掉中心的 3 个 3。') },
          B: { text: number('10'), hint: bilingual('The two full rows of 2s give 10. The middle row has a 2 at each end.', '两整行共有 10 个 2，中间一行的两端各有 1 个 2。') },
          C: { text: number('12') },
        },
        correct: 'C',
        explanation: bilingual('Inside the outer border there are 3 × 5 = 15 cells. Exclude the three 3s to get 12 cells containing 2.', '最外圈以内有 3 × 5 = 15 格，去掉 3 个 3，剩下 12 个 2。'),
        unlocked: bilingual('There are 20 ones, 12 twos, and 3 threes.', '共有 20 个 1、12 个 2 和 3 个 3。'),
      },
      {
        prompt: bilingual('What is the sum of all the numbers in the array?', '图中所有数字相加，结果是多少？'),
        options: {
          A: { text: number('35'), hint: bilingual('35 is the number of cells. A cell with 2 adds 2, and a cell with 3 adds 3.', '35 是格子的总数。写 2 的每格加 2，写 3 的每格加 3。') },
          B: { text: number('53') },
          C: { text: number('41'), hint: bilingual('Check the middle layer. Twelve copies of 2 contribute 12 × 2.', '检查中间一圈。12 个 2 的和是 12 × 2。') },
        },
        correct: 'B',
        explanation: bilingual('The sum is 20 × 1 + 12 × 2 + 3 × 3 = 20 + 24 + 9 = 53.', '总和为 20 × 1 + 12 × 2 + 3 × 3 = 20 + 24 + 9 = 53。'),
        unlocked: number('20 + 24 + 9 = 53'),
      },
    ],
  },
];
