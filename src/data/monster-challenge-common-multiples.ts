import { bilingual as bi, type ChallengeEncounter } from './monster-challenge-types';

const right = (en: string, zh = en) => ({ text: bi(en, zh) });
const wrong = (en: string, zh: string, hintEn: string, hintZh: string) => ({ text: bi(en, zh), hint: bi(hintEn, hintZh) });

export const commonMultipleEncounters: readonly ChallengeEncounter[] = [
  {
    sourceId: '2013Q10',
    monster: bi('Factor Forge', '因数熔炉'),
    title: bi('Compare the LCM and GCF', '比较最小公倍数和最大公因数'),
    stem: bi('What is the ratio of the least common multiple of 180 and 594 to the greatest common factor of 180 and 594?', '180 和 594 的最小公倍数与它们的最大公因数之比是多少？'),
    steps: [
      {
        prompt: bi('Which rule gives both values from the prime factorizations?', '根据质因数分解，怎样同时求出这两个数？'),
        options: {
          A: right('Use smaller exponents for the GCF and larger exponents for the LCM', '最大公因数取较小指数，最小公倍数取较大指数'),
          B: wrong('Use larger exponents for the GCF', '最大公因数取较大指数', 'A common factor must divide both numbers. What if one number has fewer copies of a prime?', '公因数必须能整除两个数。若其中一个数含有某个质因数的次数较少，怎么办？'),
          C: wrong('Use only primes shared by both numbers for the LCM', '最小公倍数只取共有的质因数', 'A common multiple has to contain every prime needed to divide it by either original number.', '公倍数必须能被两个原数分别整除，因此两边所需的质因数都要考虑。'),
        },
        correct: 'A',
        explanation: bi('Factor the numbers as 180 = 2²×3²×5 and 594 = 2×3³×11. Treat a missing prime as having exponent zero.', '分解得到 180 = 2²×3²×5，594 = 2×3³×11。没有出现的质数视为指数为 0。'),
        unlocked: bi('180 = 2²×3²×5; 594 = 2×3³×11.', '180 = 2²×3²×5，594 = 2×3³×11。'),
      },
      {
        prompt: bi('What is the greatest common factor?', '最大公因数是多少？'),
        options: {
          A: wrong('36', '36', '36 needs two copies of 2. How many copies of 2 does 594 have?', '36 含有两个 2，而 594 含有几个 2？'),
          B: right('18'),
          C: wrong('54', '54', '54 contains 3³, but check the exponent of 3 in 180.', '54 含有 3³，请检查 180 中 3 的指数。'),
        },
        correct: 'B',
        explanation: bi('The shared powers are 2 and 3², so the GCF is 2×9 = 18.', '两个数共有 2 和 3²，所以最大公因数是 2×9 = 18。'),
        unlocked: bi('GCF = 18.', '最大公因数是 18。'),
      },
      {
        prompt: bi('What is the least common multiple?', '最小公倍数是多少？'),
        options: {
          A: wrong('1,980', '1,980', 'This contains 3². To be divisible by 594, use 3³.', '这个数只含有 3²。要能被 594 整除，需要 3³。'),
          B: wrong('2,970', '2,970', 'This contains one factor of 2. A multiple of 180 needs 2².', '这个数只含有一个 2，而 180 的倍数必须含有 2²。'),
          C: right('5,940'),
        },
        correct: 'C',
        explanation: bi('Take 2², 3³, 5, and 11. Their product is 4×27×5×11 = 5,940.', '取 2²、3³、5 和 11，乘积为 4×27×5×11 = 5,940。'),
        unlocked: bi('LCM = 5,940.', '最小公倍数是 5,940。'),
      },
      {
        prompt: bi('Divide the LCM by the GCF. What is the ratio?', '用最小公倍数除以最大公因数，结果是多少？'),
        options: {
          A: right('330'),
          B: wrong('165', '165', 'Check the divisor. Using 36 in place of the GCF halves the quotient.', '检查除数。用 36 代替最大公因数，会把商缩小一半。'),
          C: wrong('660', '660', 'Dividing by 9 uses only the power of 3 from the GCF. Include its factor of 2.', '除以 9 只算了最大公因数中的 3²，还要把 2 算进去。'),
        },
        correct: 'A',
        explanation: bi('The requested ratio is 5,940 ÷ 18 = 330.', '所求比值为 5,940 ÷ 18 = 330。'),
        unlocked: bi('5,940 ÷ 18 = 330.', '5,940 ÷ 18 = 330。'),
      },
    ],
  },
  {
    sourceId: '2003Q19',
    monster: bi('Three Locks', '三重锁'),
    title: bi('Count multiples in an interval', '数出区间内的公倍数'),
    stem: bi('How many integers between 1000 and 2000 have all three of the numbers 15, 20, and 25 as factors?', '1000 与 2000 之间，有多少个整数同时以 15、20、25 为因数？'),
    steps: [
      {
        prompt: bi('Which numbers meet all three divisibility requirements?', '怎样找到同时满足三项整除条件的数？'),
        options: {
          A: wrong('Multiples of the GCF of 15, 20, and 25', '15、20、25 的最大公因数的倍数', 'Being divisible by their GCF is weaker than being divisible by all three original numbers.', '能被最大公因数整除的条件更宽松，并不能保证同时被三个原数整除。'),
          B: right('Multiples of the LCM of 15, 20, and 25', '15、20、25 的最小公倍数的倍数'),
          C: wrong('Multiples of 25 alone', '只数 25 的倍数', 'A multiple of 25 need not have the factors needed for 15 and 20.', '25 的倍数不一定含有 15 和 20 所需要的所有质因数。'),
        },
        correct: 'B',
        explanation: bi('The numbers must be common multiples, so they are exactly the multiples of the LCM.', '符合要求的数恰好是三数的公倍数，也就是最小公倍数的倍数。'),
        unlocked: bi('15 = 3×5; 20 = 2²×5; 25 = 5².', '15 = 3×5，20 = 2²×5，25 = 5²。'),
      },
      {
        prompt: bi('What is their least common multiple?', '这三个数的最小公倍数是多少？'),
        options: {
          A: wrong('60', '60', '60 works for 15 and 20. Check whether it includes 5² for 25.', '60 能被 15 和 20 整除。再检查能被 25 整除所需的 5²。'),
          B: wrong('150', '150', '150 contains one factor of 2. A multiple of 20 needs 2².', '150 只有一个因数 2，而 20 的倍数必须含有 2²。'),
          C: right('300'),
        },
        correct: 'C',
        explanation: bi('Use the largest powers needed: 2²×3×5² = 300.', '每个质因数取最高次幂，得到 2²×3×5² = 300。'),
        unlocked: bi('Count multiples of 300.', '只需数 300 的倍数。'),
      },
      {
        prompt: bi('How many multiples of 300 lie between 1000 and 2000?', '1000 与 2000 之间有多少个 300 的倍数？'),
        options: {
          A: right('3'),
          B: wrong('2', '2', 'Starting at 1,200, keep adding 300 until the next multiple exceeds 2,000.', '从 1,200 开始，每次加 300，直到下一个倍数超过 2,000。'),
          C: wrong('4', '4', 'Check the neighbors: 900 and 2,100 are already beyond the two bounds.', '检查两端相邻的倍数：900 和 2,100 分别在区间两侧。'),
        },
        correct: 'A',
        explanation: bi('The only multiples in the interval are 1,200, 1,500, and 1,800.', '区间内的倍数只有 1,200、1,500、1,800。'),
        unlocked: bi('Exactly 3 integers qualify.', '共有 3 个整数符合条件。'),
      },
    ],
  },
  {
    sourceId: '2008Q20',
    monster: bi('Inkling', '墨点'),
    title: bi('Use the same number of passes', '用相同的通过人数找最小班级人数'),
    stem: bi('The students in Mr. Neatkin’s class took a penmanship test. Two-thirds of the boys and three-fourths of the girls passed, and an equal number of boys and girls passed. What is the minimum possible number of students in the class?', 'Neatkin 老师的班级进行了书写测试。男生中有 2/3 通过，女生中有 3/4 通过，通过的男生人数与女生人数相等。这个班至少有多少名学生？'),
    steps: [
      {
        prompt: bi('If k boys and k girls passed, how large are the two groups?', '若有 k 名男生和 k 名女生通过，男生和女生各有多少人？'),
        options: {
          A: wrong('2k/3 boys and 3k/4 girls', '男生 2k/3 人，女生 3k/4 人', 'The number who passed is already k. Divide k by the pass fraction to recover the whole group.', 'k 已经是通过人数。用 k 除以通过比例，才能求出该组总人数。'),
          B: wrong('k boys and k girls', '男生和女生各 k 人', 'Equal pass counts do not imply equal group sizes when the pass fractions differ.', '两组通过的比例不同，因此通过人数相等不能推出两组总人数相等。'),
          C: right('3k/2 boys and 4k/3 girls', '男生 3k/2 人，女生 4k/3 人'),
        },
        correct: 'C',
        explanation: bi('Divide k by 2/3 and 3/4, respectively, to get 3k/2 and 4k/3.', '分别用 k 除以 2/3 和 3/4，可得 3k/2 和 4k/3。'),
        unlocked: bi('Boys: 3k/2. Girls: 4k/3.', '男生有 3k/2 人，女生有 4k/3 人。'),
      },
      {
        prompt: bi('What is the smallest positive k that makes both group sizes integers?', '让两组总人数都是整数的最小正整数 k 是多少？'),
        options: {
          A: right('6'),
          B: wrong('2', '2', '2 makes 3k/2 an integer. Does it also make 4k/3 an integer?', '2 能让 3k/2 成为整数。4k/3 也是整数吗？'),
          C: wrong('12', '12', '12 works, but look for the least common multiple of 2 and 3.', '12 符合条件，但还要找到 2 和 3 的最小公倍数。'),
        },
        correct: 'A',
        explanation: bi('For both group sizes to be integers, k must be divisible by both 2 and 3. The least positive choice is 6.', '要使两组人数都是整数，k 必须同时是 2 和 3 的倍数，最小可取 6。'),
        unlocked: bi('At the minimum, 6 boys and 6 girls pass.', '最小情况有 6 名男生和 6 名女生通过。'),
      },
      {
        prompt: bi('What is the minimum total number of students?', '班级最少有多少名学生？'),
        options: {
          A: wrong('12', '12', '12 counts the students who passed. The class also has students who did not pass.', '12 是通过的人数。班级还包括没有通过的学生。'),
          B: right('17'),
          C: wrong('24', '24', 'Compute 3×6/2 and 4×6/3 separately before adding them.', '先分别算出 3×6/2 和 4×6/3，再把两组人数相加。'),
        },
        correct: 'B',
        explanation: bi('There are 3×6/2 = 9 boys and 4×6/3 = 8 girls, giving 17 students.', '男生有 3×6/2 = 9 人，女生有 4×6/3 = 8 人，共 17 名学生。'),
        unlocked: bi('9 + 8 = 17 students.', '9 + 8 = 17 名学生。'),
      },
    ],
  },
  {
    sourceId: '2009Q11',
    monster: bi('Pencil Cart', '铅笔车'),
    title: bi('Use common divisors to recover a price', '用公因数反推单价'),
    stem: bi('A school bookstore sells pencils for a whole number of cents each. Some seventh graders each bought one pencil and paid $1.43 in all. Some of the 30 sixth graders each bought one pencil and paid $1.95 in all. How many more sixth graders bought a pencil than seventh graders?', '学校书店的铅笔单价为整数美分。一些七年级学生每人买了一支，共付 1.43 美元。30 名六年级学生中也有一些人每人买了一支，共付 1.95 美元。买铅笔的六年级学生比七年级学生多多少人？'),
    steps: [
      {
        prompt: bi('How must the price in cents relate to 143 and 195?', '以美分计的单价必须与 143 和 195 有什么关系？'),
        options: {
          A: wrong('It must be a multiple of both totals', '必须是两个总价的公倍数', 'A total is the price times the number of buyers. Decide which quantity is the divisor.', '总价等于单价乘购买人数。想想哪个量应当是因数。'),
          B: right('It must divide both totals', '必须能整除两个总价'),
          C: wrong('It only needs to divide 195', '只需要整除 195', 'Both grades paid the same price per pencil and bought whole numbers of pencils.', '两年级买的铅笔单价相同，购买的支数也都是整数。'),
        },
        correct: 'B',
        explanation: bi('The number of pencils equals the total in cents divided by the unit price, so both divisions must give integers.', '购买支数等于总价除以单价，因此两笔总价除以单价都必须得到整数。'),
        unlocked: bi('143 = 11×13 and 195 = 3×5×13.', '143 = 11×13，195 = 3×5×13。'),
      },
      {
        prompt: bi('Which common divisor gives a possible price?', '哪个公因数可以作为铅笔单价？'),
        options: {
          A: right('13¢', '13 美分'),
          B: wrong('1¢', '1 美分', 'A one-cent price would mean 195 sixth graders bought pencils. There are only 30.', '单价若为 1 美分，就会有 195 名六年级学生买铅笔，但六年级只有 30 人。'),
          C: wrong('11¢', '11 美分', '11 divides 143. Check that it must also divide 195.', '11 能整除 143，但还必须能整除 195。'),
        },
        correct: 'A',
        explanation: bi('The common divisors are 1 and 13. Only 13 gives at most 30 sixth-grade buyers.', '公因数只有 1 和 13。只有单价为 13 美分时，六年级的购买人数才不超过 30。'),
        unlocked: bi('Each pencil costs 13¢.', '每支铅笔 13 美分。'),
      },
      {
        prompt: bi('How many more sixth graders bought a pencil?', '买铅笔的六年级学生多多少人？'),
        options: {
          A: wrong('15', '15', '15 is the number of sixth-grade buyers. Subtract the number of seventh-grade buyers.', '15 是六年级的购买人数，还需要减去七年级的购买人数。'),
          B: wrong('52', '52', '52 is the difference in cents. How many 13-cent pencils does that buy?', '52 是相差的美分数，这笔钱能买几支单价 13 美分的铅笔？'),
          C: right('4'),
        },
        correct: 'C',
        explanation: bi('The grades bought 195/13 = 15 and 143/13 = 11 pencils. The difference is 4.', '两个年级分别买了 195/13 = 15 和 143/13 = 11 支，相差 4 支，也就是相差 4 人。'),
        unlocked: bi('15 − 11 = 4 students.', '15 − 11 = 4 人。'),
      },
    ],
  },
  {
    sourceId: '2012Q13',
    monster: bi('Penny Goblin', '零钱怪'),
    title: bi('Turn a difference in cost into a difference in quantity', '把总价差换算成数量差'),
    stem: bi('Jamar bought some pencils costing more than a penny each at the school bookstore and paid $1.43. Sharona bought some of the same pencils and paid $1.87. How many more pencils did Sharona buy than Jamar?', 'Jamar 在学校书店买了一些每支超过 1 美分的铅笔，共付 1.43 美元。Sharona 买了同样的铅笔，共付 1.87 美元。Sharona 比 Jamar 多买了几支？'),
    steps: [
      {
        prompt: bi('Which numbers must the shared price in cents divide?', '以美分计的单价必须能整除哪些数？'),
        options: {
          A: right('Both 143 and 187', '单价必须同时整除 143 和 187'),
          B: wrong('187 only', '只需要整除 187', 'Jamar’s 143 cents also paid for a whole number of identical pencils.', 'Jamar 的 143 美分也正好买了整数支同样的铅笔。'),
          C: wrong('Neither total; only their sum matters', '不必整除任何一笔，只看总和', 'Each person paid separately for a whole number of pencils, so check the two totals separately.', '两个人各自买了整数支铅笔，所以两笔总价都要分别满足整除条件。'),
        },
        correct: 'A',
        explanation: bi('Both purchases used the same unit price and bought whole numbers of pencils.', '两次购买的单价相同，购买的支数都是整数。'),
        unlocked: bi('143 = 11×13; 187 = 11×17.', '143 = 11×13，187 = 11×17。'),
      },
      {
        prompt: bi('Which common factor can be the price?', '哪个公因数可以作为单价？'),
        options: {
          A: wrong('1¢', '1 美分', 'The problem says each pencil costs more than a penny.', '题目说明每支铅笔超过 1 美分。'),
          B: wrong('13¢', '13 美分', '13 divides 143, but it must also divide 187.', '13 能整除 143，但还必须能整除 187。'),
          C: right('11¢', '11 美分'),
        },
        correct: 'C',
        explanation: bi('The only common factor greater than 1 is 11, so the price is 11 cents.', '大于 1 的公因数只有 11，所以单价为 11 美分。'),
        unlocked: bi('The extra cost is 187 − 143 = 44¢.', '多花了 187 − 143 = 44 美分。'),
      },
      {
        prompt: bi('At 11 cents each, how many extra pencils does 44 cents buy?', '每支 11 美分，多花的 44 美分可以买几支？'),
        options: {
          A: wrong('3', '3', 'Three pencils would cost only 33 cents. Check how many groups of 11 fit in 44.', '3 支只需 33 美分。算一算 44 里有几个 11。'),
          B: right('4'),
          C: wrong('5', '5', 'Five pencils would cost 55 cents, more than the extra amount.', '5 支需要 55 美分，超过了多花的 44 美分。'),
        },
        correct: 'B',
        explanation: bi('Divide the extra 44 cents by the 11-cent price to get 4 more pencils.', '用多花的 44 美分除以单价 11 美分，得到多买了 4 支。'),
        unlocked: bi('44 ÷ 11 = 4 pencils.', '44 ÷ 11 = 4 支。'),
      },
    ],
  },
  {
    sourceId: '2013Q16',
    monster: bi('Ratio Crew', '比率小队'),
    title: bi('Align two ratios at their shared group', '对齐两个比中共有的一组'),
    stem: bi('Students from Fibonacci Middle School are taking part in a community service project. The ratio of eighth graders to sixth graders is 5:3, and the ratio of eighth graders to seventh graders is 8:5. What is the smallest possible total number of students taking part?', 'Fibonacci 中学的学生参加社区服务。八年级与六年级人数之比为 5:3，八年级与七年级人数之比为 8:5。参加活动的最少有多少人？'),
    steps: [
      {
        prompt: bi('Which two numbers must divide the eighth-grade count?', '八年级人数必须同时是哪两个数的倍数？'),
        options: {
          A: wrong('3 and 5', '3 和 5', 'The 3 in 5:3 counts sixth-grade shares. Use the eighth-grade term in each ratio.', '5:3 中的 3 对应六年级。要从两个比中分别取八年级对应的项。'),
          B: wrong('3 and 8', '3 和 8', 'The first ratio gives eighth grade 5 shares, not 3 shares.', '第一个比中，八年级对应的是 5 份。'),
          C: right('5 and 8', '5 和 8'),
        },
        correct: 'C',
        explanation: bi('The eighth-grade group is 5 shares in the first ratio and 8 in the second. Both ratios are in lowest terms, so 5 and 8 must divide the count.', '八年级在第一个比中占 5 份，在第二个比中占 8 份。两比都是最简整数比，所以八年级人数必须同时被 5 和 8 整除。'),
        unlocked: bi('Use the LCM of 5 and 8.', '求 5 和 8 的最小公倍数。'),
      },
      {
        prompt: bi('What is the smallest possible number of eighth graders?', '八年级参加活动的最少有多少人？'),
        options: {
          A: right('40'),
          B: wrong('20', '20', '20 is divisible by 5, but it is not divisible by 8.', '20 能被 5 整除，但不能被 8 整除。'),
          C: wrong('80', '80', '80 meets both conditions, but check for a smaller common multiple.', '80 能同时满足两个条件，但还有更小的公倍数。'),
        },
        correct: 'A',
        explanation: bi('Since 5 and 8 are coprime, their LCM is 5×8 = 40.', '5 和 8 互质，所以最小公倍数为 5×8 = 40。'),
        unlocked: bi('With 40 eighth graders there are 40×3/5 = 24 sixth graders and 40×5/8 = 25 seventh graders.', '八年级有 40 人时，六年级有 40×3/5 = 24 人，七年级有 40×5/8 = 25 人。'),
      },
      {
        prompt: bi('What is the smallest possible total number of students?', '三组学生合计最少有多少人？'),
        options: {
          A: wrong('49', '49', '49 includes sixth and seventh graders. Include the common eighth-grade group once.', '49 只包括六年级和七年级，还要加上八年级一次。'),
          B: right('89'),
          C: wrong('129', '129', 'The same 40 eighth graders appear in both ratios. Count them once.', '两个比中的 40 名八年级学生是同一组，只数一次。'),
        },
        correct: 'B',
        explanation: bi('Add the three grade counts once each: 24 + 25 + 40 = 89. Scaling the shared group up scales every grade up.', '三个年级各数一次，得到 24 + 25 + 40 = 89。八年级人数若增大，其他两个年级的人数也会按相同比例增大。'),
        unlocked: bi('The minimum is 89 students.', '最少有 89 名学生。'),
      },
    ],
  },
  {
    sourceId: '2016Q20',
    monster: bi('Twin Gears', '双齿轮'),
    title: bi('Find the required prime powers and attain the bound', '找出必需的质数幂并验证最小值'),
    stem: bi('The least common multiple of a and b is 12, and the least common multiple of b and c is 15. What is the least possible value of the least common multiple of a and c?', 'a 和 b 的最小公倍数是 12，b 和 c 的最小公倍数是 15。a 和 c 的最小公倍数最小可能是多少？'),
    steps: [
      {
        prompt: bi('What are all possible values of b?', 'b 的所有可能值是什么？'),
        options: {
          A: wrong('3 only', '只有 3', 'b must divide both 12 and 15. Remember that 1 divides every positive integer.', 'b 必须同时整除 12 和 15。别忘了 1 可以整除任何正整数。'),
          B: right('1 or 3', '1 或 3'),
          C: wrong('1, 3, or 5', '1、3 或 5', 'Although 5 divides 15, check whether it also divides 12.', '5 能整除 15，但还要检查它是否能整除 12。'),
        },
        correct: 'B',
        explanation: bi('b divides each given LCM, so it divides the GCF of 12 and 15, which is 3. Both 1 and 3 can occur.', 'b 是两个已知最小公倍数的公因数，所以它是最大公因数 3 的因数。1 和 3 都可以取到。'),
        unlocked: bi('b contributes neither 2² nor 5.', 'b 既不能提供 2²，也不能提供 5。'),
      },
      {
        prompt: bi('Which factors must come from a and c?', '哪些因数必须分别由 a 和 c 提供？'),
        options: {
          A: right('4 must divide a and 5 must divide c', '4 必须整除 a，5 必须整除 c'),
          B: wrong('2 must divide a and 3 must divide c', '2 必须整除 a，3 必须整除 c', '12 needs 2², and 15 needs a factor of 5. Neither is available in b.', '12 需要 2²，而 15 需要 5。b 不能提供这两个因数。'),
          C: wrong('5 must divide a and 4 must divide c', '5 必须整除 a，4 必须整除 c', 'Match each prime power to its LCM: 4 divides 12 and 5 divides 15.', '把质数幂和相应的最小公倍数对应起来：4 整除 12，5 整除 15。'),
        },
        correct: 'A',
        explanation: bi('The LCM of a and b needs 4 from a. The LCM of b and c needs 5 from c. Hence LCM(a,c) is a multiple of 20.', 'a 和 b 的最小公倍数里的 4 来自 a，b 和 c 的最小公倍数里的 5 来自 c。因此 a 和 c 的最小公倍数是 20 的倍数。'),
        unlocked: bi('Test whether a = 4, b = 3, c = 5 attains 20.', '检验 a = 4、b = 3、c = 5 能否取到 20。'),
      },
      {
        prompt: bi('After checking the proposed values, what is the minimum LCM of a and c?', '验证上面的取值后，a 和 c 的最小公倍数最小可以是多少？'),
        options: {
          A: wrong('60', '60', 'A factor of 3 is needed in each given LCM, but b can supply it both times.', '两个已知最小公倍数都需要因数 3，而 b 可以同时提供。'),
          B: wrong('30', '30', '30 is not divisible by 4, which must divide a.', '30 不能被 4 整除，但 4 必须整除 a。'),
          C: right('20'),
        },
        correct: 'C',
        explanation: bi('LCM(4,3) = 12 and LCM(3,5) = 15. The same choice gives LCM(4,5) = 20, so the lower bound is attained.', '4 和 3 的最小公倍数为 12，3 和 5 的最小公倍数为 15，而 4 和 5 的最小公倍数为 20，因此下界可以取到。'),
        unlocked: bi('The minimum is 20.', '最小可能值为 20。'),
      },
    ],
  },
];
