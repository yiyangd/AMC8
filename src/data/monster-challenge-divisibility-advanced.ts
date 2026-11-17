import { bilingual, type ChallengeEncounter, type ChallengeOption } from './monster-challenge-types';

const choice = (en: string, zh = en): ChallengeOption => ({ text: bilingual(en, zh) });
const mistake = (en: string, zh: string, hintEn: string, hintZh: string): ChallengeOption => ({
  text: bilingual(en, zh),
  hint: bilingual(hintEn, hintZh),
});

export const divisibilityAdvancedEncounters: readonly ChallengeEncounter[] = [
  {
    sourceId: '2012Q18',
    monster: bilingual('Primeforge', '质数炉'),
    title: bilingual('Build the smallest product with allowed primes', '用符合条件的质数构造最小乘积'),
    stem: bilingual(
      'Find the smallest positive integer that is neither prime nor a perfect square and has no prime factor below 50.',
      '求最小的正整数，要求它既不是质数，也不是完全平方数，并且没有小于 50 的质因数。',
    ),
    steps: [
      {
        prompt: bilingual('What must be true about the prime factorization?', '这个数的质因数分解必须满足什么条件？'),
        options: {
          A: mistake('It can have no prime factors', '可以没有质因数', 'The only positive integer with no prime factors is 1, which is a perfect square.', '没有质因数的正整数只有 1，而 1 是完全平方数。'),
          B: choice('At least two prime factors, counted with repetition', '按重数计算，至少有两个质因数'),
          C: mistake('Exactly one prime factor, counted with repetition', '按重数计算，恰有一个质因数', 'A number whose entire factorization has one prime factor is itself prime.', '如果分解只含一个质因数，这个数本身就是质数。'),
        },
        correct: 'B',
        explanation: bilingual('The number is greater than 1, since 1 is a square. It is not prime, so it is composite and has at least two prime factors counted with multiplicity.', '1 是平方数，所以这个数大于 1。它也不是质数，因此是合数，按重数计算至少有两个质因数。'),
        unlocked: bilingual('The number is composite.', '这个数是合数。'),
      },
      {
        prompt: bilingual('Which is the smallest allowed product of exactly two primes?', '恰好用两个质数相乘时，最小的合格乘积是哪一个？'),
        options: {
          A: choice('53 × 59'),
          B: mistake('53 × 53', '53 × 53', 'This smallest pair has equal factors, so its product is a perfect square.', '这对最小的因数相同，乘积是完全平方数。'),
          C: mistake('51 × 53', '51 × 53', 'Although 51 exceeds 50, it is 3 × 17 and introduces prohibited prime factors.', '虽然 51 大于 50，但 51＝3×17，会引入不允许的质因数。'),
        },
        correct: 'A',
        explanation: bilingual('The smallest allowed primes are 53 and 59. With exactly two prime factors, a repeat gives a square, so the two smallest distinct primes make the smallest admissible pair.', '符合条件的最小两个质数是 53 和 59。恰有两个质因数时，若两者相同，乘积就是平方数，所以应取最小的两个不同质数。'),
        unlocked: bilingual('Smallest admissible pair: 53 × 59.', '最小的合格质数对是 53 和 59。'),
      },
      {
        prompt: bilingual('Why can no product of three or more allowed prime factors be smaller?', '为什么三个或更多合格质因数的乘积不会更小？'),
        options: {
          A: mistake('Every product of three primes is a square', '任意三个质数的乘积都是平方数', 'Three identical primes give a cube with an odd exponent, so the square claim is false.', '三个相同质数相乘得到指数为奇数的立方，不是平方数。'),
          B: mistake('Three-factor products must still use both 53 and 59', '三个因数的乘积也必须同时使用 53 和 59', 'They could repeat 53. Use the smallest permitted prime to make a lower bound.', '53 可以重复出现。用最小的合格质数建立下界。'),
          C: choice('Even 53³ exceeds 53 × 59', '即使是 53³，也大于 53 × 59'),
        },
        correct: 'C',
        explanation: bilingual('With at least three prime factors, every factor is at least 53, so the product is at least 53³. Since 53² exceeds 59, this is already greater than 53 × 59.', '若至少有三个质因数，每个都至少是 53，乘积至少为 53³。因为 53² 大于 59，所以 53³ 已经大于 53×59。'),
        unlocked: bilingual('Three or more factors give a larger product.', '使用三个或更多质因数会得到更大的乘积。'),
      },
      {
        prompt: bilingual('What is the minimum, 53 × 59?', '最小值 53×59 等于多少？'),
        options: {
          A: mistake('2809', '2809', 'That is 53², the excluded square. Compute 53 × (60 − 1).', '这是被排除的平方数 53²。试算 53×(60−1)。'),
          B: choice('3127'),
          C: mistake('3180', '3180', 'That is 53 × 60. Subtract one group of 53.', '这是 53×60。还要减去一个 53。'),
        },
        correct: 'B',
        explanation: bilingual('53 × 59 = 53 × 60 − 53 = 3180 − 53 = 3127.', '53×59＝53×60−53＝3180−53＝3127。'),
        unlocked: bilingual('Minimum: 3127.', '最小值是 3127。'),
      },
    ],
  },
  {
    sourceId: '2015Q14',
    monster: bilingual('Oddstack', '四奇叠'),
    title: bilingual('Find the divisibility rule for four consecutive odds', '找出四个连续奇数之和的整除规律'),
    stem: bilingual(
      'Which of these integers cannot be expressed as the sum of four consecutive odd integers: 16, 40, 72, 100, or 200?',
      '在 16、40、72、100 和 200 中，哪个整数不能写成四个连续奇整数之和？',
    ),
    steps: [
      {
        prompt: bilingual('If the first odd integer is 2k + 1, what is the last?', '若第一个奇整数是 2k＋1，最后一个是多少？'),
        options: {
          A: mistake('2k + 4', '2k＋4', 'Consecutive odd integers are two apart. Each integer in the list must stay odd.', '相邻奇整数相差 2，列出的每个整数都必须是奇数。'),
          B: mistake('2k + 9', '2k＋9', 'Four terms have three gaps, not four.', '四项之间只有三个间隔。'),
          C: choice('2k + 7', '2k＋7'),
        },
        correct: 'C',
        explanation: bilingual('Starting at 2k + 1 and adding 2 three times gives 2k + 1, 2k + 3, 2k + 5, and 2k + 7.', '从 2k＋1 开始，每次加 2，共加三次，得到 2k＋1、2k＋3、2k＋5、2k＋7。'),
        unlocked: bilingual('Four terms: 2k + 1, 2k + 3, 2k + 5, 2k + 7.', '四项为 2k＋1、2k＋3、2k＋5、2k＋7。'),
      },
      {
        prompt: bilingual('What is the sum of these four terms?', '把这四项相加，结果是多少？'),
        options: {
          A: mistake('4k + 16', '4k＋16', 'There are four copies of 2k, not four copies of k.', '共有四项 2k，每项都是 2k。'),
          B: choice('8k + 16', '8k＋16'),
          C: mistake('8k + 12', '8k＋12', 'Add all four constant terms: 1, 3, 5, and 7.', '别漏掉常数项，把 1、3、5、7 相加。'),
        },
        correct: 'B',
        explanation: bilingual('The sum is 8k + 16 = 8(k + 2). Every sum is a multiple of 8, and every multiple of 8 can be obtained by choosing k appropriately.', '和为 8k＋16＝8(k＋2)，一定是 8 的倍数。反过来，任意一个 8 的倍数都可以通过选择适当的 k 得到。'),
        unlocked: bilingual('Exactly the multiples of 8 are possible.', '只有 8 的倍数符合条件，而且每个 8 的倍数都可以写成这种形式。'),
      },
      {
        prompt: bilingual('Which listed number fails the condition?', '哪个原题选项不符合这个条件？'),
        options: {
          A: choice('100'),
          B: mistake('72', '72', 'Try 8 × 9. A multiple of 8 is possible.', '试算 8×9。是 8 的倍数就可以。'),
          C: mistake('200', '200', 'Try 8 × 25. Ending in two zeros does not prevent divisibility by 8 here.', '试算 8×25。200 是 8 的整数倍。'),
        },
        correct: 'A',
        explanation: bilingual('Among 16, 40, 72, 100, and 200, only 100 is not divisible by 8. It leaves remainder 4.', '16、40、72、100、200 中，只有 100 除以 8 有余数，余 4。'),
        unlocked: bilingual('Impossible sum: 100.', '不能写成这种和的是 100。'),
      },
    ],
  },
  {
    sourceId: '2016Q15',
    monster: bilingual('Powerclaw', '幂爪'),
    title: bilingual('Factor the fourth powers, then count twos', '先分解四次方差，再数因数 2'),
    stem: bilingual('What is the greatest power of 2 that divides 13⁴ − 11⁴?', '能整除 13⁴−11⁴ 的最大的 2 的幂是多少？'),
    steps: [
      {
        prompt: bilingual('Which factorization follows from the difference of squares twice?', '两次使用平方差公式，得到哪个因式分解？'),
        options: {
          A: choice('(13 − 11)(13 + 11)(13² + 11²)', '(13−11)(13＋11)(13²＋11²)'),
          B: mistake('(13 − 11)⁴', '(13−11)⁴', 'Taking the fourth power after subtracting does not preserve the difference of fourth powers.', '先相减再取四次方，不等于两个数的四次方之差。'),
          C: mistake('(13 − 11)(13 + 11)', '(13−11)(13＋11)', 'This gives the difference of the squares. There is still a factor from the first application of the formula.', '这只得到平方差。第一次套用公式时还有一个因式。'),
        },
        correct: 'A',
        explanation: bilingual('Split 13⁴ − 11⁴ into (13² − 11²)(13² + 11²). Then split 13² − 11² into (13 − 11)(13 + 11).', '先把 13⁴−11⁴ 写成 (13²−11²)(13²＋11²)，再把 13²−11² 分解成 (13−11)(13＋11)。'),
        unlocked: bilingual('The factors are 2, 24, and 290.', '三个因数是 2、24 和 290。'),
      },
      {
        prompt: bilingual('How many factors of 2 occur in 2 × 24 × 290?', '2×24×290 含有几个因数 2？'),
        options: {
          A: mistake('3', '3', 'A factor can contribute more than one 2. Divide 24 by 2 repeatedly.', '一个因数可能贡献不止一个 2。把 24 连续除以 2。'),
          B: mistake('4', '4', '24 contributes three twos and 290 contributes one. Remember the standalone factor 2.', '24 贡献三个 2，290 贡献一个 2。还有一个单独的因数 2。'),
          C: choice('5'),
        },
        correct: 'C',
        explanation: bilingual('The first factor contributes one 2, 24 = 2³ × 3 contributes three, and 290 = 2 × 145 contributes one. The remaining factor, 3 × 145, is odd.', '第一个因数贡献一个 2。24＝2³×3 贡献三个，290＝2×145 贡献一个。剩下的 3×145 是奇数。'),
        unlocked: bilingual('The exact exponent of 2 is 5.', '质因数 2 的指数恰好为 5。'),
      },
      {
        prompt: bilingual('What is the greatest power of 2 that divides the original expression?', '能整除原式的最大 2 的幂是多少？'),
        options: {
          A: mistake('16', '16', '16 = 2⁴, so it does not use all five factors of 2.', '16＝2⁴，还没有用完五个因数 2。'),
          B: choice('32'),
          C: mistake('64', '64', '64 needs six factors of 2. The odd part contributes none.', '64 需要六个因数 2，剩下的奇数部分没有因数 2。'),
        },
        correct: 'B',
        explanation: bilingual('The original expression is 2⁵ times the odd number 435. The greatest power of 2 dividing it is 2⁵ = 32.', '原式等于 2⁵ 乘奇数 435，所以最大的 2 的幂是 2⁵＝32。'),
        unlocked: bilingual('Greatest power: 32.', '最大的 2 的幂是 32。'),
      },
    ],
  },
  {
    sourceId: '2017Q19',
    monster: bilingual('Factorion', '阶乘角'),
    title: bilingual('Factor the sum before counting fives', '先提取公因数，再数因数 5'),
    stem: bilingual(
      'For any positive integer M, M! is the product of the integers from 1 through M. What is the largest integer n such that 5ⁿ divides 98! + 99! + 100!?',
      '对任意正整数 M，M! 表示从 1 到 M 的整数之积。使 5ⁿ 能整除 98!＋99!＋100! 的最大整数 n 是多少？',
    ),
    steps: [
      {
        prompt: bilingual('After factoring out 98!, what remains in parentheses?', '提取公因数 98! 后，括号内是什么？'),
        options: {
          A: mistake('98 + 99 + 100', '98＋99＋100', 'Dividing 98! by itself gives 1. For each larger factorial, keep the factors after 98.', '98! 除以自身等于 1。对较大的阶乘，保留 98 后面的因数。'),
          B: mistake('1 + 99 + 100', '1＋99＋100', 'To reach 100! from 98!, multiply by both 99 and 100.', '从 98! 到 100!，要乘 99 和 100。'),
          C: choice('1 + 99 + 99 × 100', '1＋99＋99×100'),
        },
        correct: 'C',
        explanation: bilingual('99! = 98! × 99 and 100! = 98! × 99 × 100. The bracket is 1 + 99 + 9900 = 10,000.', '99!＝98!×99，100!＝98!×99×100。括号内等于 1＋99＋9900＝10,000。'),
        unlocked: bilingual('The sum equals 98! × 10,000.', '原和等于 98!×10,000。'),
      },
      {
        prompt: bilingual('How many factors of 5 occur in 98!?', '98! 含有几个因数 5？'),
        options: {
          A: choice('22'),
          B: mistake('19', '19', 'You counted one 5 per multiple of 5. Multiples of 25 each contribute a second 5.', '你给每个 5 的倍数数了一个 5。每个 25 的倍数还要多数一个 5。'),
          C: mistake('25', '25', 'A third layer requires multiples of 125. None occur up to 98.', '第三层需要 125 的倍数，98 以内没有。'),
        },
        correct: 'A',
        explanation: bilingual('There are 19 multiples of 5 and 3 multiples of 25 up to 98. There are no multiples of 125, so the count is 19 + 3 = 22.', '98 以内有 19 个 5 的倍数和 3 个 25 的倍数，没有 125 的倍数，所以共有 19＋3＝22 个因数 5。'),
        unlocked: bilingual('98! contributes 22 factors of 5.', '98! 贡献 22 个因数 5。'),
      },
      {
        prompt: bilingual('How many additional factors of 5 does 10,000 contribute?', '10,000 又贡献几个因数 5？'),
        options: {
          A: mistake('2', '2', '10,000 = 100², and each 100 contains two factors of 5.', '10,000＝100²，每个 100 含有两个因数 5。'),
          B: choice('4'),
          C: mistake('8', '8', '10,000 = (2 × 5)⁴. Count the fives, not the twos and fives combined.', '10,000＝(2×5)⁴。只数因数 5，不要把因数 2 一起数。'),
        },
        correct: 'B',
        explanation: bilingual('10,000 = 10⁴ = 2⁴ × 5⁴, so this factor contributes four fives.', '10,000＝10⁴＝2⁴×5⁴，因此贡献四个因数 5。'),
        unlocked: bilingual('10,000 contributes 4 factors of 5.', '10,000 贡献 4 个因数 5。'),
      },
      {
        prompt: bilingual('What is the largest possible n?', 'n 的最大值是多少？'),
        options: {
          A: mistake('22', '22', 'That only counts 98!. Include the factors of 5 in 10,000.', '这只数了 98!。还要计入 10,000 的因数 5。'),
          B: mistake('27', '27', 'The two parts contribute exactly 22 and 4. There is no extra 5 in either remaining factor.', '两部分恰好分别贡献 22 和 4 个因数 5。剩余部分没有额外的因数 5。'),
          C: choice('26'),
        },
        correct: 'C',
        explanation: bilingual('In the product 98! × 10,000, the exponent of 5 is 22 + 4 = 26.', '在乘积 98!×10,000 中，质因数 5 的指数是 22＋4＝26。'),
        unlocked: bilingual('Largest n: 26.', 'n 的最大值是 26。'),
      },
    ],
  },
  {
    sourceId: '2020Q19',
    monster: bilingual('Flipfin', '交替鱼'),
    title: bilingual('Combine divisibility by 3 and by 5', '结合 3 和 5 的整除条件'),
    stem: bilingual(
      'A flippy number alternates between two distinct digits. For example, 2020 and 37373 are flippy, but 3883 and 123123 are not. How many five-digit flippy numbers are divisible by 15?',
      '如果一个数的各位数字在两个不同的数字之间交替出现，就称它为交替数。例如 2020 和 37373 是交替数，3883 和 123123 不是。能被 15 整除的五位交替数有多少个？',
    ),
    steps: [
      {
        prompt: bilingual('Write the five-digit number as ababa. Which digit must a be?', '把这个五位数写成 ababa。a 必须是哪个数字？'),
        options: {
          A: mistake('0', '0', 'a is also the leading digit, and a five-digit number cannot start with 0.', 'a 也是首位数字，而五位数不能以 0 开头。'),
          B: choice('5'),
          C: mistake('Either 0 or 5', '0 或 5 均可', 'These are the possible units digits of a multiple of 5. Here the units digit is also the first digit.', '一般来说，5 的倍数个位可以是 0 或 5。这里个位和首位相同。'),
        },
        correct: 'B',
        explanation: bilingual('A multiple of 15 is a multiple of 5, so a is 0 or 5. Since a is the leading digit, only 5 works.', '15 的倍数也是 5 的倍数，所以 a 为 0 或 5。由于 a 又是首位数字，只能为 5。'),
        unlocked: bilingual('Every candidate is 5b5b5.', '每个候选数的形式都是 5b5b5。'),
      },
      {
        prompt: bilingual('The digit sum is 15 + 2b. Which condition does divisibility by 3 impose?', '数位和为 15＋2b。要能被 3 整除，b 需满足什么条件？'),
        options: {
          A: mistake('b is odd', 'b 是奇数', 'Divisibility by 3 depends on the digit sum modulo 3, not on parity.', '判断能否被 3 整除，要看数位和除以 3 的余数，与奇偶无关。'),
          B: mistake('b must be a multiple of 5', 'b 必须是 5 的倍数', 'The units digit already guarantees divisibility by 5. Now check divisibility by 3.', '个位的 5 已保证能被 5 整除。现在检查能否被 3 整除。'),
          C: choice('b is a multiple of 3', 'b 是 3 的倍数'),
        },
        correct: 'C',
        explanation: bilingual('Since 15 is divisible by 3, 15 + 2b is divisible by 3 exactly when 2b is. Since 2 and 3 are coprime, b must be divisible by 3.', '因为 15 能被 3 整除，所以 15＋2b 能被 3 整除等价于 2b 能被 3 整除。2 与 3 互质，所以 b 必须能被 3 整除。'),
        unlocked: bilingual('b can be 0, 3, 6, or 9.', 'b 可以是 0、3、6、9。'),
      },
      {
        prompt: bilingual('How many valid numbers does that give?', '这样共有多少个符合条件的数？'),
        options: {
          A: choice('4'),
          B: mistake('3', '3', 'The digit b can be 0 because it is not the leading digit.', 'b 不是首位，所以可以为 0。'),
          C: mistake('8', '8', 'There is just one leading digit, 5. Do not count a second starting pattern.', '首位只能是 5。不要另算第二种起始形式。'),
        },
        correct: 'A',
        explanation: bilingual('Each of 0, 3, 6, and 9 differs from 5 and gives one five-digit number divisible by both 3 and 5. There are 4 numbers.', '0、3、6、9 都不同于 5，每个选择恰好得到一个既能被 3 整除又能被 5 整除的五位数，共 4 个。'),
        unlocked: bilingual('Valid numbers: 4.', '符合条件的数有 4 个。'),
      },
    ],
  },
  {
    sourceId: '2026Q16',
    monster: bilingual('Evencrest', '偶数冠'),
    title: bilingual('Reduce divisibility by 4 to the units digit', '用个位判断这个数能否被 4 整除'),
    stem: bilingual(
      'Consider all positive four-digit integers whose digits are all even. What fraction of these integers are divisible by 4?',
      '考虑所有各位数字都是偶数的四位正整数。其中能被 4 整除的数占几分之几？',
    ),
    steps: [
      {
        prompt: bilingual('How many four-digit integers can be formed from even digits?', '仅用偶数字可以组成多少个四位数？'),
        options: {
          A: choice('4 × 5³'),
          B: mistake('5⁴', '5⁴', 'The thousands digit cannot be 0. The other three positions can use it.', '千位不能为 0，其他三个数位可以为 0。'),
          C: mistake('4⁴', '4⁴', 'Only the thousands digit excludes 0. Include 0 as an option for each later digit.', '只有千位排除 0，其他数位要把 0 算进去。'),
        },
        correct: 'A',
        explanation: bilingual('The thousands digit has four choices, 2, 4, 6, and 8. Each remaining digit has five choices, including 0, for a total of 4 × 5³.', '千位有 2、4、6、8 四种选择。后三位各有包括 0 在内的五种选择，所以总数为 4×5³。'),
        unlocked: bilingual('Total: 4 × 5³ numbers.', '总共有 4×5³ 个数。'),
      },
      {
        prompt: bilingual('The tens digit is even. Which units digits make the last two digits divisible by 4?', '十位数字是偶数。哪些个位数字能让末两位组成的数被 4 整除？'),
        options: {
          A: mistake('2, 6', '2、6', 'These leave remainder 2 modulo 4. The tens contribution is already a multiple of 4.', '这两个数字除以 4 都余 2，而十位的贡献已经是 4 的倍数。'),
          B: choice('0, 4, 8', '0、4、8'),
          C: mistake('0, 2, 4, 6, 8', '0、2、4、6、8', 'Evenness alone only ensures divisibility by 2. For example, 22 is not divisible by 4.', '偶数只保证能被 2 整除。例如 22 不能被 4 整除。'),
        },
        correct: 'B',
        explanation: bilingual('Only the last two digits affect divisibility by 4. With an even tens digit t, 10t is divisible by 4, so the units digit must be a multiple of 4.', '能否被 4 整除只取决于末两位。若十位 t 是偶数，则 10t 能被 4 整除，所以个位也必须是 4 的倍数。'),
        unlocked: bilingual('The allowed units digits are 0, 4, and 8.', '符合条件的个位数字为 0、4 和 8。'),
      },
      {
        prompt: bilingual('What fraction of all the numbers meet the divisibility condition?', '能被 4 整除的数占全部数的几分之几？'),
        options: {
          A: mistake('2/5', '2/5', 'Two of the units digits fail the condition. The question asks for the ones that work.', '有两个个位数字不合格。题目问的是合格的比例。'),
          B: mistake('3/4', '3/4', 'The leading digit has four possibilities, but the fraction depends on the five units possibilities, including 0.', '千位有四种选择，但比例由个位的五种选择决定，其中包括 0。'),
          C: choice('3/5'),
        },
        correct: 'C',
        explanation: bilingual('For every fixed first three digits, exactly three of the five units digits work. The fraction is (4 × 5 × 5 × 3)/(4 × 5³) = 3/5.', '固定前三位后，个位的五种选择中恰有三种合格，所以比例为 (4×5×5×3)/(4×5³)＝3/5。'),
        unlocked: bilingual('Fraction divisible by 4: 3/5.', '能被 4 整除的比例是 3/5。'),
      },
    ],
  },
  {
    sourceId: '2006Q25',
    monster: bilingual('Cardshell', '卡牌壳'),
    title: bilingual('Use parity and the only even prime', '用奇偶性和唯一的偶质数推理'),
    stem: bilingual(
      'Barry wrote six distinct numbers on three cards, one number on each side. The visible faces show 44, 59, and 38. Each card has the same sum of its two numbers, and the three hidden numbers are primes. What is the average of the hidden primes?',
      'Barry 在三张卡片的正反两面各写一个数，六个数互不相同。可见的三个数是 44、59、38。每张卡片两面数字之和都相等，藏在背面的三个数都是质数。这三个质数的平均值是多少？',
    ),
    steps: [
      {
        prompt: bilingual('If the common sum were even, why would the cards showing 44 and 38 be impossible?', '如果每张卡片两面的和是偶数，显示 44 和 38 的两张卡片会有什么矛盾？'),
        options: {
          A: mistake('Their backs would need to be odd', '它们的背面必须是奇数', 'An even front plus an odd back gives an odd total.', '偶数正面加奇数背面，和是奇数。'),
          B: choice('Both hidden primes would have to be 2', '两个背面质数都只能是 2'),
          C: mistake('Both visible numbers would have to be prime', '两个可见的数都必须是质数', 'Only hidden numbers must be prime. What parity must the hidden numbers have if the sums are even?', '只有背面的数字必须是质数。若和为偶数，背面数字的奇偶性是什么？'),
        },
        correct: 'B',
        explanation: bilingual('An even total and an even visible number force an even hidden number. The only even prime is 2, so both backs would be 2, contradicting distinctness.', '和与可见数字都是偶数时，背面数字也必须是偶数。唯一的偶质数是 2，所以两个背面都只能是 2，与六个数互不相同矛盾。'),
        unlocked: bilingual('The common sum is odd.', '每张卡片两面的和是奇数。'),
      },
      {
        prompt: bilingual('The front showing 59 is odd. What is its two-sided sum?', '59 是奇数。这张卡片两面的和是多少？'),
        options: {
          A: choice('61'),
          B: mistake('60', '60', 'That would use 1 on the back. One is not prime, and the sum must be odd.', '这样背面是 1，而 1 不是质数，且和必须是奇数。'),
          C: mistake('62', '62', 'Adding the odd prime 3 to the odd front makes an even total.', '奇数质数 3 加上奇数 59，得到偶数。'),
        },
        correct: 'A',
        explanation: bilingual('An odd front and an odd sum force an even back. The only possible prime there is 2, so the common sum is 59 + 2 = 61.', '正面与和都是奇数，背面必须是偶数。背面是质数，只能为 2，所以共同的和为 59＋2＝61。'),
        unlocked: bilingual('Common sum: 61. One hidden prime: 2.', '共同的和是 61，其中一个背面质数是 2。'),
      },
      {
        prompt: bilingual('What are the hidden numbers behind 44 and 38, respectively?', '44 和 38 背后的质数分别是多少？'),
        options: {
          A: mistake('23, 17', '23、17', 'Use 61 − 44 for the first back and 61 − 38 for the second.', '第一个要算 61−44，第二个要算 61−38。'),
          B: mistake('15, 21', '15、21', 'Those pairs would add to 59. Use the common sum 61, and remember both backs are prime.', '这样配对的和是 59。共同的和是 61，而且背面必须是质数。'),
          C: choice('17, 23', '17、23'),
        },
        correct: 'C',
        explanation: bilingual('The other backs are 61 − 44 = 17 and 61 − 38 = 23. Both are prime and all six numbers are distinct.', '另外两个背面分别是 61−44＝17 和 61−38＝23。二者都是质数，且六个数互不相同。'),
        unlocked: bilingual('Hidden primes: 2, 17, 23.', '三个背面质数为 2、17、23。'),
      },
      {
        prompt: bilingual('What is the average of the three hidden primes?', '这三个背面质数的平均值是多少？'),
        options: {
          A: choice('14'),
          B: mistake('20', '20', 'That averages 17 and 23 only. Include 2 and divide by three.', '这只平均了 17 和 23。要计入 2，并除以 3。'),
          C: mistake('42', '42', 'That is the sum. Divide it by the number of hidden primes.', '这是总和。还要除以背面质数的个数。'),
        },
        correct: 'A',
        explanation: bilingual('The average is (2 + 17 + 23)/3 = 42/3 = 14.', '平均值为 (2＋17＋23)/3＝42/3＝14。'),
        unlocked: bilingual('Average: 14.', '平均值是 14。'),
      },
    ],
  },
  {
    sourceId: '2008Q22',
    monster: bilingual('Rangeback', '区间兽'),
    title: bilingual('Intersect the bounds and count multiples', '取范围的交集，再数倍数'),
    stem: bilingual('For how many positive integers n are both n/3 and 3n three-digit whole numbers?', '有多少个正整数 n，使 n/3 和 3n 都是三位整数？'),
    steps: [
      {
        prompt: bilingual('Which interval meets both three-digit size requirements?', '哪个范围同时满足两个数的大小都在三位数之内？'),
        options: {
          A: choice('300 ≤ n ≤ 333'),
          B: mistake('34 ≤ n ≤ 333', '34 ≤ n ≤ 333', 'This range only keeps 3n between 100 and 999. Also require n/3 to be at least 100.', '这个范围只保证 3n 在 100 到 999 之间。还要保证 n/3 至少为 100。'),
          C: mistake('300 ≤ n ≤ 2997', '300 ≤ n ≤ 2997', 'This range only keeps n/3 between 100 and 999. Apply the upper limit for 3n as well.', '这个范围只保证 n/3 在 100 到 999 之间。还要使用 3n 的上限。'),
        },
        correct: 'A',
        explanation: bilingual('The quotient n/3 must be at least 100, so n ≥ 300. The product 3n must be at most 999, so n ≤ 333. Both remaining bounds are satisfied throughout this interval.', '由 n/3 至少为 100，得到 n≥300。由 3n 至多为 999，得到 n≤333。这个范围也满足另外两个大小限制。'),
        unlocked: bilingual('Size bounds: 300 ≤ n ≤ 333.', '取值范围是 300≤n≤333。'),
      },
      {
        prompt: bilingual('Which numbers in this interval also make both results integers?', '这个范围里的哪些 n 还能保证两个运算结果都是整数？'),
        options: {
          A: mistake('Every integer from 300 to 333', '300 到 333 的每个整数', 'For example, 301 is in range but its quotient by 3 is not an integer.', '例如 301 在这个范围内，但除以 3 后不是整数。'),
          B: mistake('Only multiples of 9', '只有 9 的倍数', 'The quotient divides by 3 once. It does not need to be another multiple of 3.', '这里只需除以 3 一次，所得商不用再是 3 的倍数。'),
          C: choice('Multiples of 3 from 300 to 333', '300 到 333 之间的 3 的倍数'),
        },
        correct: 'C',
        explanation: bilingual('The product 3n is always an integer. The quotient n/3 is an integer exactly when n is a multiple of 3. The list is 300, 303, …, 333.', '3n 一定是整数。n/3 是整数等价于 n 是 3 的倍数，所以符合条件的是 300、303、……、333。'),
        unlocked: bilingual('Count 300, 303, …, 333.', '要数的是 300、303、……、333。'),
      },
      {
        prompt: bilingual('How many values are in the list, including both endpoints?', '包括首尾两项，这个数列共有多少项？'),
        options: {
          A: mistake('11', '11', 'The quotient (333 − 300)/3 counts gaps, not terms. Include the first term.', '(333−300)/3 数的是间隔，不是项数。还要加上第一项。'),
          B: choice('12'),
          C: mistake('34', '34', 'That counts all integers in the interval, including those not divisible by 3.', '这个数法把不能被 3 整除的整数也算进去了。'),
        },
        correct: 'B',
        explanation: bilingual('There are (333 − 300)/3 = 11 gaps of size 3, so there are 11 + 1 = 12 terms.', '每隔 3 取一个数，从 300 到 333 共有 (333−300)/3＝11 个间隔，所以有 11＋1＝12 项。'),
        unlocked: bilingual('Valid n: 12 values.', '符合条件的 n 有 12 个。'),
      },
    ],
  },
  {
    sourceId: '2014Q21',
    monster: bilingual('Digitveil', '数位面甲'),
    title: bilingual('Subtract digit sums to eliminate the unknowns', '数位和相减，消去共同的未知数'),
    stem: bilingual(
      'Both seven-digit numbers 74A52B1 and 326AB4C are multiples of 3, where A, B, and C stand for digits. Which of 1, 2, 3, 5, and 8 could be C?',
      '七位数 74A52B1 和 326AB4C 都是 3 的倍数，其中 A、B、C 表示数字。C 可能是 1、2、3、5、8 中哪一个？',
    ),
    steps: [
      {
        prompt: bilingual('What are the two digit sums, in the same order as the problem?', '按原题的顺序，这两个数的数位和分别是什么？'),
        options: {
          A: mistake('18 + A + B and 15 + A + B + C', '18＋A＋B 和 15＋A＋B＋C', 'The first constant sum must include the final digit 1.', '第一个数的已知数位还要包括末位的 1。'),
          B: mistake('19 + A + B and 11 + A + B + C', '19＋A＋B 和 11＋A＋B＋C', 'The second constant sum includes the digit 4 just before C.', '第二个数的已知数位中还有 C 前面的 4。'),
          C: choice('19 + A + B and 15 + A + B + C', '19＋A＋B 和 15＋A＋B＋C'),
        },
        correct: 'C',
        explanation: bilingual('The fixed digits in the first number sum to 7 + 4 + 5 + 2 + 1 = 19. In the second, they sum to 3 + 2 + 6 + 4 = 15.', '第一个数的已知数位之和为 7＋4＋5＋2＋1＝19。第二个数的已知数位之和为 3＋2＋6＋4＝15。'),
        unlocked: bilingual('Both 19 + A + B and 15 + A + B + C are multiples of 3.', '19＋A＋B 和 15＋A＋B＋C 都是 3 的倍数。'),
      },
      {
        prompt: bilingual('Subtract the first digit sum from the second. Which expression must be a multiple of 3?', '用第二个数位和减去第一个数位和。哪个式子一定是 3 的倍数？'),
        options: {
          A: choice('C − 4', 'C−4'),
          B: mistake('C + 4', 'C＋4', 'Keep the subtraction order: the constant part is 15 − 19.', '注意相减的顺序，常数部分是 15−19。'),
          C: mistake('C', 'C', 'A and B cancel, but the constant parts 15 and 19 are different.', 'A 和 B 抵消了，但两个常数 15 和 19 不同。'),
        },
        correct: 'A',
        explanation: bilingual('The difference of multiples of 3 is another multiple of 3. Subtracting cancels both A and B and leaves C − 4.', '3 的两个倍数相减仍是 3 的倍数。相减时 A 和 B 都抵消，得到 C−4。'),
        unlocked: bilingual('C leaves remainder 1 when divided by 3.', 'C 除以 3 余 1。'),
      },
      {
        prompt: bilingual('Which offered value of C has the required remainder?', '原题选项中，C 取哪个值才有正确的余数？'),
        options: {
          A: mistake('3', '3', '3 leaves remainder 0, whereas 4 leaves remainder 1.', '3 除以 3 余 0，而 4 除以 3 余 1。'),
          B: choice('1'),
          C: mistake('8', '8', '8 − 4 = 4 is not a multiple of 3.', '8−4＝4，不是 3 的倍数。'),
        },
        correct: 'B',
        explanation: bilingual('Of 1, 2, 3, 5, and 8, only 1 has remainder 1 modulo 3. It is possible, for example with A = 0 and B = 2, because both digit sums are then multiples of 3.', '在 1、2、3、5、8 中，只有 1 除以 3 余 1。取 A＝0、B＝2 时，两个数位和均为 3 的倍数，因此 C＝1 确实可行。'),
        unlocked: bilingual('Possible listed value: C = 1.', '原题选项中，C 可以是 1。'),
      },
    ],
  },
  {
    sourceId: '2026Q24',
    monster: bilingual('Sevenfold', '七重幂'),
    title: bilingual('Count repeated contributions across factorials', '统计因数在各个阶乘中的重复贡献'),
    stem: bilingual(
      'The factorial n! is the product of the first n positive integers. The superfactorial of n is 1! × 2! × … × n!, so the superfactorial of 3 is 12. How many factors of 7 appear in the prime factorization of the superfactorial of 51?',
      'n 的阶乘 n! 是前 n 个正整数的乘积。n 的超阶乘定义为 1!×2!×……×n!，例如 3 的超阶乘是 12。51 的超阶乘分解质因数后，含有几个因数 7？',
    ),
    steps: [
      {
        prompt: bilingual('Fix a multiple m of 7. When the factorials are written as products of consecutive integers, which include the integer m?', '固定一个 7 的倍数 m。把各个阶乘写成连续整数的乘积，哪些阶乘的乘数中会出现 m？'),
        options: {
          A: mistake('Only m!', '只有 m!', 'Once a factorial includes m, every larger factorial also includes m.', '一个阶乘含有 m 后，每个更大的阶乘也含有 m。'),
          B: mistake('1! through m!', '从 1! 到 m!', 'A factorial smaller than m! stops before reaching the factor m.', '比 m! 小的阶乘在取到 m 前就结束了。'),
          C: choice('m! through 51!', '从 m! 到 51!'),
        },
        correct: 'C',
        explanation: bilingual('In the product 1 × 2 × … × j for j!, the integer m appears exactly when j ≥ m. Thus it appears in 52 − m of the factorials.', '在 j! 的展开式 1×2×……×j 中，只有当 j≥m 时才会出现 m。因此 m 共出现在 52−m 个阶乘里。'),
        unlocked: bilingual('m occurs in 52 − m factorials.', 'm 出现在 52−m 个阶乘里。'),
      },
      {
        prompt: bilingual('Counting one factor of 7 for each multiple in each factorial, what are the contributions from 7 and 49?', '每次出现一个 7 的倍数，先只数一个因数 7。数字 7 和 49 各贡献多少个？'),
        options: {
          A: choice('45 and 3', '45 和 3'),
          B: mistake('44 and 2', '44 和 2', 'Include the first factorial containing each multiple and also include 51!.', '要包含首次出现该倍数的阶乘，也要包含最后的 51!。'),
          C: mistake('7 and 49', '7 和 49', 'Count how many factorials contain the number, not the value of the number itself.', '要数的是这个数出现于多少个阶乘里，而不是其本身的数值。'),
        },
        correct: 'A',
        explanation: bilingual('The first multiple 7 is in 7! through 51!, or 45 factorials. The last multiple 49 is in 49! through 51!, or 3 factorials.', '第一个倍数 7 出现在 7! 到 51!，共 45 次。最后一个倍数 49 出现在 49! 到 51!，共 3 次。'),
        unlocked: bilingual('First-layer counts: 45, 38, 31, 24, 17, 10, 3.', '第一层计数为 45、38、31、24、17、10、3。'),
      },
      {
        prompt: bilingual('What is the total of the seven first-layer contributions?', '第一层的七项贡献加起来是多少？'),
        options: {
          A: mistake('147', '147', 'The first and last counts are 45 and 3. Their average is 24, not 21.', '首项 45、末项 3，平均数是 24。'),
          B: choice('168'),
          C: mistake('336', '336', 'Pairing the endpoints gives 48 for two terms. Multiply the average, not the pair sum, by 7.', '首尾配对时，两项之和为 48。乘以 7 的应是单项平均数。'),
        },
        correct: 'B',
        explanation: bilingual('The seven counts form an arithmetic sequence with average (45 + 3)/2 = 24. Their sum is 7 × 24 = 168.', '这七项构成等差数列，平均数为 (45＋3)/2＝24，总和为 7×24＝168。'),
        unlocked: bilingual('First-layer total: 168.', '第一层总数是 168。'),
      },
      {
        prompt: bilingual('How many factors of 7 were missed in that first layer?', '第一层计算还漏掉几个因数 7？'),
        options: {
          A: choice('3'),
          B: mistake('1', '1', '49 contributes one extra 7 each time it appears. It appears in more than one factorial.', '49 每出现一次就多贡献一个 7。它不只出现在一个阶乘中。'),
          C: mistake('6', '6', 'One of the two factors of 7 in 49 was already counted each time. Add only the second one.', '49 的两个因数 7 中，每次已经数了一个。只需补数另一个。'),
        },
        correct: 'A',
        explanation: bilingual('49 = 7² is the only multiple of 7² at most 51 and appears in 49!, 50!, and 51!. Add one extra 7 for each appearance. No number at most 51 is a multiple of 7³.', '51 以内唯一的 7² 的倍数是 49。它出现在 49!、50!、51! 中，每次多贡献一个 7。51 以内没有 7³ 的倍数。'),
        unlocked: bilingual('Add three extra factors of 7.', '还要加 3 个额外的因数 7。'),
      },
      {
        prompt: bilingual('What is the total exponent of 7?', '质因数 7 的总指数是多少？'),
        options: {
          A: mistake('168', '168', 'This is the first-layer count. Add the extra contributions from 49.', '这是第一层总数。还要补上 49 的额外贡献。'),
          B: mistake('174', '174', 'Only one factor was missed each time 49 appeared, so add 3, not 6.', '49 每出现一次只漏了一个因数 7，所以额外加 3。'),
          C: choice('171'),
        },
        correct: 'C',
        explanation: bilingual('The superfactorial has 168 first-layer factors of 7 and 3 extra factors contributed by 49, for a total of 171.', '超阶乘第一层含有 168 个因数 7，49 额外贡献 3 个，总数是 171。'),
        unlocked: bilingual('Total factors of 7: 171.', '共有 171 个因数 7。'),
      },
    ],
  },
];
