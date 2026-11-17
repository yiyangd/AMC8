import { bilingual, type ChallengeEncounter } from './monster-challenge-types';

const number = (value: string) => bilingual(value, value);

export const divisibilityBasicEncounters: readonly ChallengeEncounter[] = [
  {
    sourceId: '2003Q2',
    monster: bilingual('Pebble', '石粒'),
    title: bilingual('Look for the smallest prime factor', '从最小的质因数入手'),
    stem: bilingual(
      'Which of these numbers has the smallest prime factor? 55, 57, 58, 59, or 61.',
      '55、57、58、59、61 中，哪个数含有最小的质因数？',
    ),
    steps: [
      {
        prompt: bilingual('Which prime should you check first?', '应该先检查哪个质数？'),
        options: {
          A: { text: number('1'), hint: bilingual('A prime has exactly two positive divisors. Count the divisors of 1.', '质数恰好有两个正因数。数一数 1 有几个正因数。') },
          B: { text: number('2') },
          C: { text: number('3'), hint: bilingual('3 is prime. Check whether a smaller whole number also has exactly two positive divisors.', '3 是质数。看看比 3 小的整数中，是否也有恰好两个正因数的数。') },
        },
        correct: 'B',
        explanation: bilingual('The number 2 has exactly two positive divisors, 1 and 2. Every other prime is larger.', '2 恰好有两个正因数：1 和 2。其他质数都比 2 大。'),
        unlocked: bilingual('The smallest prime is 2.', '最小的质数是 2。'),
      },
      {
        prompt: bilingual('Which test tells you that 2 is a factor?', '用什么方法能判断一个数有因数 2？'),
        options: {
          A: { text: bilingual('Its ones digit is even', '个位数字是偶数') },
          B: { text: bilingual('Its digits add to an even number', '各位数字相加得到偶数'), hint: bilingual('Try 11. Its digits add to 2, but 11 is odd. Look at the ones digit.', '试试 11。各位数字和是 2，但 11 是奇数。看看个位。') },
          C: { text: bilingual('Its tens digit is even', '十位数字是偶数'), hint: bilingual('Both 21 and 22 have tens digit 2. Only one is divisible by 2.', '21 和 22 的十位都是 2，但只有一个数能被 2 整除。') },
        },
        correct: 'A',
        explanation: bilingual('Tens contribute multiples of 10, and all multiples of 10 are even. The ones digit decides the parity.', '十位表示 10 的倍数，一定是偶数，所以整个数的奇偶性由个位决定。'),
        unlocked: bilingual('An even ones digit gives the prime factor 2.', '个位是偶数的数一定有质因数 2。'),
      },
      {
        prompt: bilingual('Which listed number has 2 as a factor?', '给出的数中，哪个数有因数 2？'),
        options: {
          A: { text: number('55'), hint: bilingual('55 ends in 5 and has prime factor 5. Look for an even number.', '55 的个位是 5，所以它有质因数 5。看看哪个数是偶数。') },
          B: { text: number('57'), hint: bilingual('57 has prime factor 3 because its digits sum to 12. The winning factor is even smaller.', '57 的各位数字和是 12，所以有质因数 3。题目要找比 3 更小的质因数。') },
          C: { text: number('58') },
        },
        correct: 'C',
        explanation: bilingual('58 is the only even candidate. Since 58 = 2 × 29, its prime factor 2 is as small as possible.', '58 是唯一的偶数。58 = 2 × 29，它含有最小的质因数 2。'),
        unlocked: number('58 = 2 × 29'),
      },
    ],
  },
  {
    sourceId: '2007Q3',
    monster: bilingual('Pip', '籽籽'),
    title: bilingual('Add distinct prime factors', '不同的质因数各加一次'),
    stem: bilingual(
      'What is the sum of the two smallest prime factors of 250?',
      '250 的两个最小质因数之和是多少？',
    ),
    steps: [
      {
        prompt: bilingual('Which smallest prime divides 250?', '能整除 250 的最小质数是哪个？'),
        options: {
          A: { text: number('2') },
          B: { text: number('3'), hint: bilingual('The digits of 250 add to 7, which is not a multiple of 3.', '250 的各位数字和是 7，不是 3 的倍数。') },
          C: { text: number('5'), hint: bilingual('5 does divide 250. The last digit is even, so a smaller prime divides it too.', '5 确实能整除 250。它的个位是偶数，还有一个更小的质数可以整除它。') },
        },
        correct: 'A',
        explanation: bilingual('250 is even, so it is divisible by the smallest prime, 2. Dividing gives 125.', '250 是偶数，所以能被最小的质数 2 整除。250 ÷ 2 = 125。'),
        unlocked: number('250 = 2 × 125'),
      },
      {
        prompt: bilingual('Which product breaks 125 into primes?', '哪个算式把 125 完全分解成了质因数？'),
        options: {
          A: { text: number('5 × 25'), hint: bilingual('25 divides further into two factors of 5.', '25 还可以分解成两个 5。') },
          B: { text: number('5 × 5 × 5') },
          C: { text: number('5 × 5'), hint: bilingual('Five times five is only 25. Include another factor.', '两个 5 相乘只有 25，还要再乘一个因数。') },
        },
        correct: 'B',
        explanation: bilingual('125 = 5 × 25 = 5 × 5 × 5. The only prime in this part of the factorization is 5.', '125 = 5 × 25 = 5 × 5 × 5。这一部分只出现了质数 5。'),
        unlocked: number('250 = 2 × 5³'),
      },
      {
        prompt: bilingual('What is the sum of the two different primes?', '这两个不同的质因数之和是多少？'),
        options: {
          A: { text: number('10'), hint: bilingual('10 is the product of 2 and 5. The question asks for their sum.', '10 是 2 和 5 的乘积。这里要计算的是它们的和。') },
          B: { text: number('12'), hint: bilingual('The prime 5 appears more than once in the product, but it is only one distinct prime.', '分解式中有多个 5，但作为不同的质因数，5 只算一次。') },
          C: { text: number('7') },
        },
        correct: 'C',
        explanation: bilingual('The two distinct prime factors are 2 and 5, giving 2 + 5 = 7.', '不同的质因数只有 2 和 5，所以 2 + 5 = 7。'),
        unlocked: number('2 + 5 = 7'),
      },
    ],
  },
  {
    sourceId: '2014Q8',
    monster: bilingual('Zip', '小链'),
    title: bilingual('Use the divisibility test for 11', '用 11 的整除判定'),
    stem: bilingual(
      'Eleven middle school math club members each contributed the same whole-dollar amount to pay a guest speaker. The total was $1A2. What is the missing digit A?',
      '中学数学俱乐部的 11 名成员各付相同的整美元数，邀请一位嘉宾演讲。总金额为 1A2 美元。缺失的数字 A 是多少？',
    ),
    steps: [
      {
        prompt: bilingual('What must be true of the total 1A2?', '总金额 1A2 一定满足什么条件？'),
        options: {
          A: { text: bilingual('It must be a multiple of 10', '一定是 10 的倍数'), hint: bilingual('The group size is 11. Equal whole-dollar shares make the total a multiple of that size.', '有 11 名成员。每份都是相同的整数美元，所以总金额是人数的倍数。') },
          B: { text: bilingual('It must equal 11', '一定等于 11'), hint: bilingual('11 tells you the number of contributions; the total is 11 times one contribution.', '11 是付款人数。总金额等于每人支付的金额乘 11。') },
          C: { text: bilingual('It must be a multiple of 11', '一定是 11 的倍数') },
        },
        correct: 'C',
        explanation: bilingual('The total equals 11 times the amount paid by one club member.', '总金额是每位成员付款金额的 11 倍。'),
        unlocked: bilingual('The total 1A2 is divisible by 11.', '总金额 1A2 能被 11 整除。'),
      },
      {
        prompt: bilingual('Which digit expression should be a multiple of 11?', '用哪一个数字算式检验能否被 11 整除？'),
        options: {
          A: { text: number('1 − A + 2') },
          B: { text: number('1 + A + 2'), hint: bilingual('Adding all the digits is useful for divisibility by 3 or 9. For 11, alternate the signs.', '各位数字直接相加可用来判断 3 或 9 的整除。判断 11 时要让符号正负交替。') },
          C: { text: number('1 − A − 2'), hint: bilingual('The hundreds and ones positions have the same sign in an alternating sum.', '在交替和中，百位和个位的符号相同。') },
        },
        correct: 'A',
        explanation: bilingual('For 11, take the alternating sum of the digits: 1 − A + 2 = 3 − A.', '判断 11 的整除时，计算各位数字的交替和：1 − A + 2 = 3 − A。'),
        unlocked: bilingual('3 − A must be a multiple of 11.', '3 − A 必须是 11 的倍数。'),
      },
      {
        prompt: bilingual('Which digit A makes 3 − A a multiple of 11?', 'A 取哪个数字时，3 − A 是 11 的倍数？'),
        options: {
          A: { text: number('0'), hint: bilingual('Putting 0 in gives 3. The only multiple of 11 from −6 through 3 is 0.', '代入 0 会得到 3。从 −6 到 3，只有 0 是 11 的倍数。') },
          B: { text: number('3') },
          C: { text: number('4'), hint: bilingual('Putting 4 in gives −1. Look for the digit that makes the expression zero.', '代入 4 会得到 −1。找出让这个算式等于零的数字。') },
        },
        correct: 'B',
        explanation: bilingual('Because A is a digit, 3 − A is between −6 and 3. Thus 3 − A = 0, so A = 3. Check: 132 = 11 × 12.', 'A 是一位数字，所以 3 − A 在 −6 到 3 之间。因此 3 − A = 0，得 A = 3。检验：132 = 11 × 12。'),
        unlocked: number('A = 3'),
      },
    ],
  },
  {
    sourceId: '2016Q9',
    monster: bilingual('Cluster', '积团'),
    title: bilingual('Separate repeated and distinct prime factors', '区分重复的质因数与不同的质因数'),
    stem: bilingual(
      'What is the sum of the distinct prime integer divisors of 2016?',
      '2016 的所有不同质因数之和是多少？',
    ),
    steps: [
      {
        prompt: bilingual('Keep dividing 2016 by 2 while the quotient is even. Which odd number remains?', '只要商是偶数，就继续把 2016 除以 2。最后剩下哪个奇数？'),
        options: {
          A: { text: number('126'), hint: bilingual('126 is still even. Divide by 2 once more.', '126 还是偶数，可以再除以 2。') },
          B: { text: number('63') },
          C: { text: number('21'), hint: bilingual('Getting from 63 to 21 uses division by 3. This step removes only factors of 2.', '从 63 到 21 要除以 3。这一步只去掉因数 2。') },
        },
        correct: 'B',
        explanation: bilingual('2016 ÷ 2⁵ = 63, so 2016 = 2⁵ × 63. Since 63 is odd there are no more factors of 2.', '2016 ÷ 2⁵ = 63，所以 2016 = 2⁵ × 63。63 是奇数，已经不能再除以 2。'),
        unlocked: number('2016 = 2⁵ × 63'),
      },
      {
        prompt: bilingual('Which primes divide 63?', '63 有哪些质因数？'),
        options: {
          A: { text: bilingual('9 and 7', '9 和 7'), hint: bilingual('9 divides 63 but is composite. Break 9 into primes.', '9 是 63 的因数，但 9 是合数。把 9 继续分解。') },
          B: { text: bilingual('3 and 21', '3 和 21'), hint: bilingual('21 divides into 3 × 7. Include each different prime.', '21 还可分解为 3 × 7。把不同的质数分别列出。') },
          C: { text: bilingual('3 and 7', '3 和 7') },
        },
        correct: 'C',
        explanation: bilingual('63 = 9 × 7 = 3² × 7, so its prime divisors are 3 and 7.', '63 = 9 × 7 = 3² × 7，所以它的质因数是 3 和 7。'),
        unlocked: number('2016 = 2⁵ × 3² × 7'),
      },
      {
        prompt: bilingual('Add each different prime factor once. What is the sum?', '每个不同的质因数各加一次。和是多少？'),
        options: {
          A: { text: number('12') },
          B: { text: number('18'), hint: bilingual('18 uses 9 in place of 3. The prime itself is 3.', '18 把 3² 算成了 9。要加的是质数 3 本身。') },
          C: { text: number('23'), hint: bilingual('23 adds repeated copies of 2 and 3. Count each prime just once.', '23 把重复出现的 2 和 3 都加了进去。每种质数只加一次。') },
        },
        correct: 'A',
        explanation: bilingual('The exponents record how often each prime occurs in a product. The distinct primes are 2, 3, and 7, giving 2 + 3 + 7 = 12.', '指数表示各质因数在乘积中出现的次数。不同的质因数是 2、3 和 7，所以 2 + 3 + 7 = 12。'),
        unlocked: number('2 + 3 + 7 = 12'),
      },
    ],
  },
  {
    sourceId: '2018Q7',
    monster: bilingual('Orbit', '小环'),
    title: bilingual('Find a missing digit before dividing', '先补齐数字，再求余数'),
    stem: bilingual(
      'The five-digit number 2018U is divisible by 9. What is its remainder when divided by 8?',
      '五位数 2018U 能被 9 整除。这个数除以 8 的余数是多少？',
    ),
    steps: [
      {
        prompt: bilingual('What must be a multiple of 9?', '哪个量必须是 9 的倍数？'),
        options: {
          A: { text: number('9 + U'), hint: bilingual('Add every known digit: 2 + 0 + 1 + 8.', '把所有已知的数字相加：2 + 0 + 1 + 8。') },
          B: { text: number('11 + U') },
          C: { text: number('U'), hint: bilingual('To test divisibility by 9, include all five digits.', '判断 9 的整除时，要把五个位上的数字全部相加。') },
        },
        correct: 'B',
        explanation: bilingual('A number is divisible by 9 exactly when its digit sum is a multiple of 9. Here the sum is 2 + 0 + 1 + 8 + U = 11 + U.', '一个数能被 9 整除，当且仅当它的各位数字和是 9 的倍数。这里各位数字和是 2 + 0 + 1 + 8 + U = 11 + U。'),
        unlocked: bilingual('11 + U is a multiple of 9.', '11 + U 是 9 的倍数。'),
      },
      {
        prompt: bilingual('The digit sum is between 11 and 20. What is U?', '各位数字和在 11 到 20 之间。U 是多少？'),
        options: {
          A: { text: number('7') },
          B: { text: number('8'), hint: bilingual('11 + 8 = 19. Check the nearby multiple of 9.', '11 + 8 = 19。找找相邻的 9 的倍数。') },
          C: { text: number('9'), hint: bilingual('11 + 9 = 20. The digit sum itself must be divisible by 9.', '11 + 9 = 20。要能被 9 整除的是整个数字和。') },
        },
        correct: 'A',
        explanation: bilingual('The only multiple of 9 from 11 through 20 is 18. Set 11 + U = 18 to get U = 7.', '11 到 20 之间唯一的 9 的倍数是 18。由 11 + U = 18，得 U = 7。'),
        unlocked: bilingual('The five-digit number is 20187.', '这个五位数是 20187。'),
      },
      {
        prompt: bilingual('What is the remainder when 20187 is divided by 8?', '20187 除以 8 的余数是多少？'),
        options: {
          A: { text: number('1'), hint: bilingual('The last three digits, 187, control the remainder because 1000 is a multiple of 8. Compare 187 to 8 × 23.', '因为 1000 是 8 的倍数，所以只需要看末三位 187。比较 187 和 8 × 23。') },
          B: { text: number('5'), hint: bilingual('192 is above 187. Subtract the largest multiple of 8 below 187 instead.', '192 比 187 大。求余数时，用 187 减去不超过它的最大 8 的倍数。') },
          C: { text: number('3') },
        },
        correct: 'C',
        explanation: bilingual('Discard the multiple of 1000 and use 187 = 8 × 23 + 3. The remainder is 3.', '前面的整千部分能被 8 整除，只需算 187 = 8 × 23 + 3，所以余数为 3。'),
        unlocked: number('20187 = 8 × 2523 + 3'),
      },
    ],
  },
  {
    sourceId: '2000Q11',
    monster: bilingual('Ticker', '数轮'),
    title: bilingual('Count divisibility by the ones digit', '按个位数字的整除条件分类计数'),
    stem: bilingual(
      'The number 64 is divisible by its ones digit, 4. How many whole numbers between 10 and 50 are divisible by their own ones digit?',
      '64 能被它的个位数字 4 整除。10 与 50 之间有多少个整数能被自己的个位数字整除？',
    ),
    steps: [
      {
        prompt: bilingual('The tens digit is t and the nonzero ones digit is d. Which test replaces checking 10t + d?', '十位是 t，个位是非零数字 d。要判断 d 能否整除 10t + d，可以改为检查什么？'),
        options: {
          A: { text: bilingual('Check whether d divides 10t', '检查 d 能否整除 10t') },
          B: { text: bilingual('Check whether d divides t', '检查 d 能否整除 t'), hint: bilingual('The tens digit t contributes 10t to the number. Subtracting the ones digit leaves 10t.', '十位数字 t 在原数中表示 10t。减去个位数字后，还剩 10t。') },
          C: { text: bilingual('Check whether d divides 10', '检查 d 能否整除 10'), hint: bilingual('The tens digit can be 1, 2, 3, or 4. The multiple of ten depends on it.', '十位可以是 1、2、3、4。剩下的整十数取决于十位。') },
        },
        correct: 'A',
        explanation: bilingual('Since d divides d, adding or removing d does not change the remainder upon dividing by d. A ones digit of zero is excluded because division by zero is undefined.', 'd 能整除自己。加上或减去 d 不会改变除以 d 的余数。因为不能除以零，所以个位不能是 0。'),
        unlocked: bilingual('For each t, count one-digit divisors of 10t.', '对每个 t，数出 10t 有几个一位数的正因数。'),
      },
      {
        prompt: bilingual('How many valid ones digits are there in the teens and in the twenties, respectively?', '十几和二十几中，各有多少种符合要求的个位数字？'),
        options: {
          A: { text: bilingual('4 and 5', '4 个和 5 个'), hint: bilingual('List only divisors from 1 through 9. The divisor 10 cannot be a digit.', '只列出 1 到 9 的因数。10 不能作为个位数字。') },
          B: { text: bilingual('3 and 4', '3 个和 4 个') },
          C: { text: bilingual('3 and 3', '3 个和 3 个'), hint: bilingual('The number 20 has a one-digit divisor that does not divide 10. Try 4.', '20 有一个 10 没有的一位数因数。试试 4。') },
        },
        correct: 'B',
        explanation: bilingual('The one-digit divisors of 10 are 1, 2, 5. Those of 20 are 1, 2, 4, 5.', '10 的一位数因数是 1、2、5。20 的一位数因数是 1、2、4、5。'),
        unlocked: bilingual('Teens contribute 3 numbers. Twenties contribute 4.', '十几贡献 3 个数，二十几贡献 4 个数。'),
      },
      {
        prompt: bilingual('How many valid ones digits are there in the thirties and in the forties, respectively?', '三十几和四十几中，各有多少种符合要求的个位数字？'),
        options: {
          A: { text: bilingual('4 and 5', '4 个和 5 个'), hint: bilingual('For 30, remember that 6 also divides 30 because 6 × 5 = 30.', '数 30 的因数时，别漏掉 6，因为 6 × 5 = 30。') },
          B: { text: bilingual('5 and 4', '5 个和 4 个'), hint: bilingual('For 40, include 8 because 8 × 5 = 40.', '数 40 的因数时，把 8 也算进去，因为 8 × 5 = 40。') },
          C: { text: bilingual('5 and 5', '5 个和 5 个') },
        },
        correct: 'C',
        explanation: bilingual('For 30 the digits are 1, 2, 3, 5, 6. For 40 the digits are 1, 2, 4, 5, 8.', '30 的一位数因数是 1、2、3、5、6。40 的一位数因数是 1、2、4、5、8。'),
        unlocked: bilingual('Thirties and forties each contribute 5 numbers.', '三十几和四十几各贡献 5 个数。'),
      },
      {
        prompt: bilingual('What is the total across the four groups?', '把四组加起来，一共有多少个数？'),
        options: {
          A: { text: number('17') },
          B: { text: number('16'), hint: bilingual('Use both groups of 5. The four group sizes are 3, 4, 5, and 5.', '两组 5 都要加。四组的数量分别是 3、4、5、5。') },
          C: { text: number('18'), hint: bilingual('Check each group count. The teens contribute 3, and an ending digit of zero never qualifies.', '核对每组数量。十几只贡献 3 个，而且个位为 0 的数不符合条件。') },
        },
        correct: 'A',
        explanation: bilingual('The groups are separate, so their counts add to 3 + 4 + 5 + 5 = 17.', '四组互不重叠，合起来是 3 + 4 + 5 + 5 = 17 个。'),
        unlocked: number('3 + 4 + 5 + 5 = 17'),
      },
    ],
  },
  {
    sourceId: '2005Q18',
    monster: bilingual('Stride', '步步'),
    title: bilingual('Count multiples between inclusive endpoints', '确定首尾倍数后计数'),
    stem: bilingual(
      'How many three-digit numbers are divisible by 13?',
      '有多少个三位数能被 13 整除？',
    ),
    steps: [
      {
        prompt: bilingual('What is the smallest integer k for which 13k has three digits?', '使 13k 成为三位数的最小整数 k 是多少？'),
        options: {
          A: { text: number('7'), hint: bilingual('13 × 7 = 91, which still has two digits.', '13 × 7 = 91，还是两位数。') },
          B: { text: number('8') },
          C: { text: number('9'), hint: bilingual('Try decreasing the multiplier by 1. The product remains at least 100.', '把乘数减 1 试试。乘积仍不小于 100。') },
        },
        correct: 'B',
        explanation: bilingual('13 × 7 = 91 is too small, and 13 × 8 = 104 is the first three-digit multiple.', '13 × 7 = 91 太小，而 13 × 8 = 104 是第一个三位数倍数。'),
        unlocked: number('13 × 8 = 104'),
      },
      {
        prompt: bilingual('What is the largest integer k for which 13k is at most 999?', '使 13k 不超过 999 的最大整数 k 是多少？'),
        options: {
          A: { text: number('75'), hint: bilingual('13 × 75 = 975. Adding another 13 still stays below 1000.', '13 × 75 = 975。再加一个 13，仍小于 1000。') },
          B: { text: number('77'), hint: bilingual('13 × 77 = 1001, which has four digits.', '13 × 77 = 1001，已经是四位数。') },
          C: { text: number('76') },
        },
        correct: 'C',
        explanation: bilingual('13 × 76 = 988 fits, while 13 × 77 = 1001 exceeds 999.', '13 × 76 = 988 符合条件，而 13 × 77 = 1001 超过了 999。'),
        unlocked: number('13 × 76 = 988'),
      },
      {
        prompt: bilingual('How many integers are there from 8 through 76?', '从 8 到 76（包括两端）有多少个整数？'),
        options: {
          A: { text: number('69') },
          B: { text: number('68'), hint: bilingual('76 − 8 counts the gaps between multipliers. Include both endpoint multipliers in the count.', '76 − 8 数的是乘数之间的间隔。两个端点的乘数都要算进去。') },
          C: { text: number('76'), hint: bilingual('76 is the last multiplier. The valid multipliers start at 8, so remove 1 through 7.', '76 是最后一个乘数。符合条件的乘数从 8 开始，所以要去掉 1 到 7。') },
        },
        correct: 'A',
        explanation: bilingual('Each multiplier from 8 through 76 gives one valid multiple. Count 76 − 8 + 1 = 69.', '8 到 76 的每个乘数对应一个符合条件的倍数，因此有 76 − 8 + 1 = 69 个。'),
        unlocked: number('76 − 8 + 1 = 69'),
      },
    ],
  },
  {
    sourceId: '2008Q15',
    monster: bilingual('Swish', '空心球'),
    title: bilingual('Use integer averages to pin down totals', '用整数平均数确定总分'),
    stem: bilingual(
      'Theresa scored 7, 4, 3, 6, 8, 3, 1, and 5 points in her first eight basketball games. In each of her next two games, she scored fewer than 10 points. Her average after nine games and her average after ten games were both whole numbers. What is the product of her scores in games 9 and 10?',
      'Theresa 前八场篮球比赛分别得了 7、4、3、6、8、3、1、5 分。接下来的两场，她每场得分都少于 10 分。前九场和前十场的平均得分都为整数。第九场与第十场得分的乘积是多少？',
    ),
    steps: [
      {
        prompt: bilingual('What is the sum of the first eight scores?', '前八场的总分是多少？'),
        options: {
          A: { text: number('35'), hint: bilingual('Regroup 7 + 3, 4 + 6, and 8 + 1 to check the total systematically.', '把 7 与 3、4 与 6、8 与 1 分组，再把剩下的数加进去。') },
          B: { text: number('37') },
          C: { text: number('40'), hint: bilingual('After pairing 7 + 3 and 4 + 6 into tens, add 8 + 3 + 1 + 5.', '先把 7 + 3 和 4 + 6 各凑成 10，再加 8 + 3 + 1 + 5。') },
        },
        correct: 'B',
        explanation: bilingual('Regroup as (7 + 3) + (4 + 6) + (8 + 1) + (3 + 5) = 10 + 10 + 9 + 8 = 37.', '重新分组得 (7 + 3) + (4 + 6) + (8 + 1) + (3 + 5) = 10 + 10 + 9 + 8 = 37。'),
        unlocked: bilingual('Total after 8 games = 37.', '前八场总分为 37。'),
      },
      {
        prompt: bilingual('Game 9 adds at most 9 points. To make the new total a multiple of 9, how many points did Theresa score?', '第九场最多增加 9 分。要让新的总分是 9 的倍数，Theresa 这一场得了多少分？'),
        options: {
          A: { text: number('5'), hint: bilingual('Adding 5 to 37 gives 42. Find a multiple of 9 from 37 through 46.', '37 加 5 得 42。要在 37 到 46 之间找一个 9 的倍数。') },
          B: { text: number('9'), hint: bilingual('Adding 9 keeps the remainder of 37 upon division by 9. Instead, move up to the next multiple.', '37 加 9 后，除以 9 的余数不变。应该找到下一个 9 的倍数。') },
          C: { text: number('8') },
        },
        correct: 'C',
        explanation: bilingual('The next total lies from 37 through 46. Only 45 is a multiple of 9, giving a score of 45 − 37 = 8.', '新的总分在 37 到 46 之间。只有 45 是 9 的倍数，所以第九场得 45 − 37 = 8 分。'),
        unlocked: bilingual('Game 9 = 8 points. Total after 9 games = 45.', '第九场得 8 分。前九场总分为 45。'),
      },
      {
        prompt: bilingual('Game 10 makes the total a multiple of 10. How many points did it add?', '第十场结束后，总分必须是 10 的倍数。这一场增加了多少分？'),
        options: {
          A: { text: number('5') },
          B: { text: number('0'), hint: bilingual('A total of 45 is not divisible by 10. Find the next multiple of 10.', '45 不能被 10 整除。找下一个 10 的倍数。') },
          C: { text: number('10'), hint: bilingual('The game score is below 10, and the prior total is 45, not 40.', '单场得分小于 10，而且上一场结束后的总分是 45。') },
        },
        correct: 'A',
        explanation: bilingual('The total is now between 45 and 54, so it must be 50. Thus game 10 added 50 − 45 = 5.', '总分现在在 45 到 54 之间，所以只能是 50。第十场得 50 − 45 = 5 分。'),
        unlocked: bilingual('Game 10 = 5 points.', '第十场得 5 分。'),
      },
      {
        prompt: bilingual('What is the product of the two game scores?', '第九场和第十场的得分相乘，结果是多少？'),
        options: {
          A: { text: number('13'), hint: bilingual('13 is the sum of 8 and 5. Calculate their product.', '13 是 8 与 5 的和。这里要算两者的乘积。') },
          B: { text: number('40') },
          C: { text: number('50'), hint: bilingual('50 is the total score after ten games. This step uses only the last two individual scores.', '50 是前十场的总分。这一步只要用最后两场各自的得分。') },
        },
        correct: 'B',
        explanation: bilingual('Multiply the two individual scores: 8 × 5 = 40.', '把两场各自的得分相乘：8 × 5 = 40。'),
        unlocked: number('8 × 5 = 40'),
      },
    ],
  },
  {
    sourceId: '2010Q14',
    monster: bilingual('Shard', '晶片'),
    title: bilingual('Factor in stages and check the last factor', '逐步分解并检查最后的因数'),
    stem: bilingual('What is the sum of the prime factors of 2010?', '2010 的所有质因数之和是多少？'),
    steps: [
      {
        prompt: bilingual('2010 = 10 × 201. Which primes come from the factor 10?', '2010 = 10 × 201。因数 10 可以分解成哪两个质数？'),
        options: {
          A: { text: number('2 × 5') },
          B: { text: number('2 × 10'), hint: bilingual('The product must be 10. Also, 10 itself can be factored further.', '乘积必须是 10。10 本身还可以继续分解。') },
          C: { text: number('1 × 10'), hint: bilingual('The factorization needs prime factors. 1 is not prime, and 10 is composite.', '这里要分解成质数。1 不是质数，10 是合数。') },
        },
        correct: 'A',
        explanation: bilingual('10 = 2 × 5, leaving the factor 201 to break down.', '10 = 2 × 5，接下来分解另一个因数 201。'),
        unlocked: number('2010 = 2 × 5 × 201'),
      },
      {
        prompt: bilingual('The digits of 201 add to 3. What remains after dividing 201 by 3?', '201 的各位数字和是 3。201 除以 3 得多少？'),
        options: {
          A: { text: number('63'), hint: bilingual('63 × 3 = 189. Raise the quotient enough to make 201.', '63 × 3 = 189。把商增大一些，使乘积等于 201。') },
          B: { text: number('67') },
          C: { text: number('70'), hint: bilingual('70 × 3 = 210. Back up by three groups of 3.', '70 × 3 = 210，还要减去三个 3。') },
        },
        correct: 'B',
        explanation: bilingual('The digit sum confirms divisibility by 3, and 201 = 3 × 67.', '各位数字和说明 201 能被 3 整除，且 201 = 3 × 67。'),
        unlocked: number('2010 = 2 × 5 × 3 × 67'),
      },
      {
        prompt: bilingual('Which primes are enough to check whether 67 is prime?', '要判断 67 是不是质数，试除哪些质数就够了？'),
        options: {
          A: { text: bilingual('Only 2 and 3', '只检查 2 和 3'), hint: bilingual('Check every prime at most √67. Two more primes are below that cutoff.', '要检查所有不超过 √67 的质数。这个范围里还有两个质数。') },
          B: { text: bilingual('Only 11 and 13', '只检查 11 和 13'), hint: bilingual('If 67 were composite, at least one prime divisor would be at most √67, which is below 9.', '如果 67 是合数，它至少有一个质因数不大于 √67，而 √67 小于 9。') },
          C: { text: bilingual('2, 3, 5, and 7', '2、3、5 和 7') },
        },
        correct: 'C',
        explanation: bilingual('Since 8² < 67 < 9², test 2, 3, 5, and 7. None divides 67, so it is prime.', '因为 8² < 67 < 9²，所以试除 2、3、5、7。它们都不能整除 67，所以 67 是质数。'),
        unlocked: bilingual('67 is prime.', '67 是质数。'),
      },
      {
        prompt: bilingual('What is the sum of 2, 3, 5, and 67?', '2、3、5 与 67 的和是多少？'),
        options: {
          A: { text: number('77') },
          B: { text: number('75'), hint: bilingual('75 includes 3, 5, and 67. Remember the factor 2 from 10.', '75 已经加上了 3、5、67。别漏掉 10 分解出的质数 2。') },
          C: { text: number('67'), hint: bilingual('67 is the largest prime factor. Add the three smaller prime factors too.', '67 只是最大的质因数，还要加上三个较小的质因数。') },
        },
        correct: 'A',
        explanation: bilingual('The three small prime factors sum to 2 + 3 + 5 = 10, so the full sum is 67 + 10 = 77.', '三个较小的质因数加起来是 2 + 3 + 5 = 10，所以总和为 67 + 10 = 77。'),
        unlocked: number('2 + 3 + 5 + 67 = 77'),
      },
    ],
  },
  {
    sourceId: '2011Q17',
    monster: bilingual('Powercap', '幂帽'),
    title: bilingual('Match exponents in a prime factorization', '根据质因数分解确定指数'),
    stem: bilingual(
      'Let w, x, y, and z be whole numbers. If 2ʷ × 3ˣ × 5ʸ × 7ᶻ = 588, what is 2w + 3x + 5y + 7z?',
      '设 w、x、y、z 为非负整数。若 2ʷ × 3ˣ × 5ʸ × 7ᶻ = 588，则 2w + 3x + 5y + 7z 等于多少？',
    ),
    steps: [
      {
        prompt: bilingual('How many factors of 2 can be removed from 588?', '588 可以连续除以 2 几次，直到商为奇数？'),
        options: {
          A: { text: number('1'), hint: bilingual('588 ÷ 2 = 294, which is still even.', '588 ÷ 2 = 294，294 仍是偶数。') },
          B: { text: number('2') },
          C: { text: number('3'), hint: bilingual('After dividing by 2 twice you get 147. Check its ones digit before trying again.', '连续除以 2 两次得到 147。再除一次之前先看看它的个位。') },
        },
        correct: 'B',
        explanation: bilingual('588 ÷ 2 = 294 and 294 ÷ 2 = 147. Since 147 is odd, 588 = 2² × 147 and w = 2.', '588 ÷ 2 = 294，294 ÷ 2 = 147。由于 147 是奇数，588 = 2² × 147，所以 w = 2。'),
        unlocked: number('588 = 2² × 147'),
      },
      {
        prompt: bilingual('Which product breaks 147 into primes?', '147 分解成质因数后得到什么？'),
        options: {
          A: { text: number('3 × 7²') },
          B: { text: number('3² × 7'), hint: bilingual('147 ÷ 3 = 49. The repeated prime is the one whose square is 49.', '147 ÷ 3 = 49。找出平方等于 49 的质数。') },
          C: { text: number('3 × 7 × 5'), hint: bilingual('147 does not end in 0 or 5. Divide by 3 and factor the quotient 49.', '147 的个位既不是 0 也不是 5。先除以 3，再分解所得的 49。') },
        },
        correct: 'A',
        explanation: bilingual('147 ÷ 3 = 49, and 49 = 7 × 7. Thus 147 = 3 × 7².', '147 ÷ 3 = 49，而 49 = 7 × 7。因此 147 = 3 × 7²。'),
        unlocked: number('588 = 2² × 3 × 7²'),
      },
      {
        prompt: bilingual('Which ordered list gives (w, x, y, z)?', '哪一组按顺序给出了 (w, x, y, z)？'),
        options: {
          A: { text: number('(2, 1, 1, 2)'), hint: bilingual('A positive exponent of 5 would make 588 divisible by 5. Check its ones digit.', '如果 5 的指数为正数，588 就能被 5 整除。检查它的个位。') },
          B: { text: number('(2, 2, 0, 1)'), hint: bilingual('The factor 49 is 7². The factor 3 occurs once.', '因数 49 是 7²。因数 3 只出现一次。') },
          C: { text: number('(2, 1, 0, 2)') },
        },
        correct: 'C',
        explanation: bilingual('Read the exponents of 2, 3, 5, and 7 in that order. Since there is no factor 5, its exponent is zero.', '按 2、3、5、7 的顺序读取指数。没有质因数 5，所以它的指数是 0。'),
        unlocked: number('(w, x, y, z) = (2, 1, 0, 2)'),
      },
      {
        prompt: bilingual('What is 2w + 3x + 5y + 7z?', '2w + 3x + 5y + 7z 等于多少？'),
        options: {
          A: { text: number('21') },
          B: { text: number('26'), hint: bilingual('The term 5y contributes 0 because y = 0.', '因为 y = 0，所以 5y 这一项等于 0。') },
          C: { text: number('56'), hint: bilingual('Add the four contributions. The terms 2w and 7z contribute 4 and 14 to a sum.', '把四项的结果相加。其中 2w 和 7z 分别给总和贡献 4 和 14。') },
        },
        correct: 'A',
        explanation: bilingual('Substitute the exponents: 2 × 2 + 3 × 1 + 5 × 0 + 7 × 2 = 4 + 3 + 0 + 14 = 21.', '代入指数：2 × 2 + 3 × 1 + 5 × 0 + 7 × 2 = 4 + 3 + 0 + 14 = 21。'),
        unlocked: number('2w + 3x + 5y + 7z = 21'),
      },
    ],
  },
];
