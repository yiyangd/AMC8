import { bilingual, type ChallengeEncounter } from './monster-challenge-types';

export const advancedEncounters: readonly ChallengeEncounter[] = [
  {
    sourceId: '2000Q8',
    monster: bilingual('Stack', '叠叠'),
    title: bilingual('Subtract visible dots from the total', '用总点数减去可见点数'),
    stem: bilingual(
      'Three dice with faces numbered 1 through 6 are stacked as shown. Seven of the eighteen faces are visible, leaving eleven faces hidden (back, bottom, between). What is the total number of dots hidden in this view?',
      '三颗骰子堆叠如图。每颗骰子的六个面分别有 1 到 6 个点。十八个面中有七个面看得见，其余十一个面藏在背面、底面或接触处。看不见的点一共有多少个？',
    ),
    figure: {
      source: 'game/2000-dice.webp',
      description: bilingual(
        'Three dice in a vertical stack. The top die shows 1 on top, 2 at the front and 3 at the right. The middle die shows 4 at the front and 6 at the right. The bottom die shows 5 at the front and 1 at the right.',
        '三颗骰子竖直叠放。最上面一颗的顶面为 1 点、正面为 2 点、右面为 3 点。中间一颗的正面为 4 点、右面为 6 点。最下面一颗的正面为 5 点、右面为 1 点。',
      ),
    },
    steps: [
      {
        prompt: bilingual('How can you find the hidden dots using the picture?', '怎样利用图形求出看不见的点数？'),
        options: {
          A: { text: bilingual('Use 11 as the number of hidden dots', '把 11 当成看不见的点数'), hint: bilingual('Eleven counts faces. Each face can have several dots.', '11 数的是面。每个面上可能有多个点。') },
          B: { text: bilingual('Subtract visible dots from all dots', '用总点数减去可见点数') },
          C: { text: bilingual('Only add the dots in the picture', '只把图中看得见的点相加'), hint: bilingual('That gives the visible dots. How can you use that count to get the hidden part?', '这样求出的是可见点数。想想怎样用它得到看不见的点数。') },
        },
        correct: 'B',
        explanation: bilingual('Every dot is either visible or hidden. Subtract the visible count from the total.', '每个点要么看得见，要么看不见，用总点数减去可见点数。'),
        unlocked: bilingual('Hidden dots = all dots − visible dots.', '看不见的点数＝总点数−可见点数。'),
      },
      {
        prompt: bilingual('One die has 1 + 2 + 3 + 4 + 5 + 6 = 21 dots. How many dots do all three dice have?', '一颗骰子有 1＋2＋3＋4＋5＋6＝21 个点。三颗骰子一共有多少个点？'),
        options: {
          A: { text: bilingual('21', '21'), hint: bilingual('That counts one die. There are three dice in the stack.', '这是单颗骰子的点数。图中一共有三颗骰子。') },
          B: { text: bilingual('126', '126'), hint: bilingual('The 21 dots already include all six faces of one die. Multiply by the number of dice.', '21 已经包括一颗骰子的六个面。只需乘骰子的颗数。') },
          C: { text: bilingual('63', '63') },
        },
        correct: 'C',
        explanation: bilingual('There are 3 × 21 = 63 dots on the three dice.', '三颗骰子的总点数是 3×21＝63。'),
        unlocked: bilingual('Total dots: 63.', '总点数是 63。'),
      },
      {
        prompt: bilingual('How many dots are visible on the seven faces shown?', '图中看得见的七个面上，一共有多少个点？'),
        options: {
          A: { text: bilingual('22', '22') },
          B: { text: bilingual('7', '7'), hint: bilingual('Seven is the number of visible faces. Count the dots on each face.', '7 是看得见的面数。请数每个面上的点数。') },
          C: { text: bilingual('17', '17'), hint: bilingual('Check the front face of the bottom die. It contributes five dots.', '检查最下面那颗骰子的正面；这个面还有 5 个点。') },
        },
        correct: 'A',
        explanation: bilingual('The visible faces show 1 + 2 + 3 + 4 + 6 + 5 + 1 = 22 dots.', '可见面的点数相加为 1＋2＋3＋4＋6＋5＋1＝22。'),
        unlocked: bilingual('Visible dots: 22.', '可见点数是 22。'),
      },
      {
        prompt: bilingual('Of the 63 dots, 22 are visible. How many are hidden?', '63 个点中有 22 个看得见。有多少个点看不见？'),
        options: {
          A: { text: bilingual('22', '22'), hint: bilingual('Twenty-two is the visible count. Use the rest of the total.', '22 是可见点数。求的是总数中剩下的部分。') },
          B: { text: bilingual('41', '41') },
          C: { text: bilingual('52', '52'), hint: bilingual('Subtract the visible dot count, 22. Eleven describes hidden faces.', '减去看得见的 22 个点。11 指的是看不见的面数。') },
        },
        correct: 'B',
        explanation: bilingual('The hidden dots total 63 − 22 = 41.', '看不见的点一共有 63−22＝41 个。'),
        unlocked: bilingual('Hidden dots: 41.', '看不见的点数是 41。'),
      },
    ],
  },
  {
    sourceId: '2019Q17',
    monster: bilingual('Twincoil', '双卷'),
    title: bilingual('Split the product into two canceling chains', '把乘积拆成两条可约分的链'),
    stem: bilingual(
      'What is the value of ((1 × 3)/(2 × 2)) × ((2 × 4)/(3 × 3)) × ((3 × 5)/(4 × 4)) × … × ((97 × 99)/(98 × 98)) × ((98 × 100)/(99 × 99))?',
      '求 ((1×3)/(2×2)) × ((2×4)/(3×3)) × ((3×5)/(4×4)) × … × ((97×99)/(98×98)) × ((98×100)/(99×99)) 的值。',
    ),
    steps: [
      {
        prompt: bilingual('How can you rewrite each term to organize the cancellation?', '怎样改写每一项，让约分有规律地进行？'),
        options: {
          A: { text: bilingual('Split each term into two fractions, then multiply the first fractions and the second fractions separately', '把每项拆成两个分数，再把各项的第一个分数、第二个分数分别相乘') },
          B: { text: bilingual('Use the first and last terms only', '只保留第一项和最后一项'), hint: bilingual('The middle terms contain the factors that cancel. Keep track of them before crossing anything out.', '中间项提供了用于约分的因数。先找清各因数，再消去。') },
          C: { text: bilingual('Subtract the denominator from the numerator in every term', '每一项都用分子减去分母'), hint: bilingual('Here each term is a ratio. Splitting its products into fractions preserves the value.', '每一项都是一个比。把分子、分母中的乘积拆为两个分数，才能保持原值。') },
        },
        correct: 'A',
        explanation: bilingual('For example, (1 × 3)/(2 × 2) = (1/2) × (3/2). Collect the first fractions and the second fractions in two separate products.', '例如 (1×3)/(2×2)＝(1/2)×(3/2)。把每组的第一个分数、第二个分数分别相乘。'),
        unlocked: bilingual('First chain: 1/2 × 2/3 × … × 98/99. Second chain: 3/2 × 4/3 × … × 100/99.', '第一条链：1/2 × 2/3 × … × 98/99。第二条链：3/2 × 4/3 × … × 100/99。'),
      },
      {
        prompt: bilingual('What does the first chain, 1/2 × 2/3 × … × 98/99, reduce to?', '第一条链 1/2 × 2/3 × … × 98/99 化简后等于多少？'),
        options: {
          A: { text: bilingual('1/98', '1/98'), hint: bilingual('The 98 in the final numerator cancels. The final denominator is 99.', '末项分子 98 会被约掉。末项分母是 99。') },
          B: { text: bilingual('1/99', '1/99') },
          C: { text: bilingual('1/2', '1/2'), hint: bilingual('The 2 in the first denominator cancels against the 2 in the next numerator.', '首项分母的 2 与下一项分子的 2 约掉了。') },
        },
        correct: 'B',
        explanation: bilingual('Factors 2 through 98 appear once above and once below. The first numerator and final denominator leave 1/99.', '2 到 98 在分子和分母各出现一次，约掉后剩下首项分子和末项分母，得到 1/99。'),
        unlocked: bilingual('First chain = 1/99.', '第一条链等于 1/99。'),
      },
      {
        prompt: bilingual('What does the second chain, 3/2 × 4/3 × … × 100/99, reduce to?', '第二条链 3/2 × 4/3 × … × 100/99 化简后等于多少？'),
        options: {
          A: { text: bilingual('100/99', '100/99'), hint: bilingual('The final denominator 99 cancels against the numerator of the previous fraction.', '最后一个分母 99 和前一个分数的分子 99 约掉了。') },
          B: { text: bilingual('99/2', '99/2'), hint: bilingual('The last numerator is 100. Check which of 99 and 100 has a matching denominator.', '最后一个分子是 100。检查 99 和 100 中哪个在分母也出现。') },
          C: { text: bilingual('100/2', '100/2') },
        },
        correct: 'C',
        explanation: bilingual('Factors 3 through 99 cancel in the second chain. The 100 on top and 2 on the bottom give 100/2 = 50.', '第二条链中的 3 到 99 都约掉了，分子 100 和分母 2 得到 100/2＝50。'),
        unlocked: bilingual('Second chain = 50.', '第二条链等于 50。'),
      },
      {
        prompt: bilingual('Multiply the results from the two chains, 1/99 and 50. What is the product?', '两条链的结果是 1/99 和 50。它们的乘积是多少？'),
        options: {
          A: { text: bilingual('50/99', '50/99') },
          B: { text: bilingual('100/99', '100/99'), hint: bilingual('The second chain is 100/2, so multiply 1/99 by 50.', '第二条链是 100/2，所以用 1/99 乘以 50。') },
          C: { text: bilingual('50', '50'), hint: bilingual('Fifty is the value of the second chain. Include the factor from the first chain.', '50 只是第二条链的值，还要乘第一条链的结果。') },
        },
        correct: 'A',
        explanation: bilingual('The product is (1/99) × 50 = 50/99.', '乘积是 (1/99)×50＝50/99。'),
        unlocked: bilingual('Product: 50/99.', '乘积是 50/99。'),
      },
    ],
  },
  {
    sourceId: '2020Q12',
    monster: bilingual('Factor', '因因'),
    title: bilingual('Keep the large factorial intact', '保留大阶乘，化简其他因数'),
    stem: bilingual(
      'For a positive integer n, the factorial n! is the product of the integers from n down to 1. For example, 6! = 6 × 5 × 4 × 3 × 2 × 1. What value of N satisfies 5! × 9! = 12 × N!?',
      '对正整数 n，阶乘 n! 表示从 n 到 1 的所有整数相乘。例如 6!＝6×5×4×3×2×1。等式 5!×9!＝12×N! 中，N 等于多少？',
    ),
    steps: [
      {
        prompt: bilingual('Which operation isolates N! while keeping 9! as a factor?', '要单独得到 N!，同时保留因数 9!，该做哪一步？'),
        options: {
          A: { text: bilingual('Multiply both sides by 12', '两边都乘以 12'), hint: bilingual('Multiplication would add another factor of 12. Which inverse operation removes it?', '再乘会多出一个因数 12。要消去它，应该用哪种逆运算？') },
          B: { text: bilingual('Subtract 12 from both sides', '两边都减去 12'), hint: bilingual('The 12 multiplies N!, so use the inverse of multiplication.', '12 与 N! 是相乘的关系，所以要用乘法的逆运算。') },
          C: { text: bilingual('Divide both sides by 12', '两边都除以 12') },
        },
        correct: 'C',
        explanation: bilingual('Divide both sides by 12, then group the numerical factor as N! = (5! ÷ 12) × 9!.', '两边都除以 12，把数值因数合在一起，得到 N!＝(5!÷12)×9!。'),
        unlocked: bilingual('N! = (5! ÷ 12) × 9!.', 'N!＝(5!÷12)×9!。'),
      },
      {
        prompt: bilingual('What is the smaller factorial, 5!?', '较小的阶乘 5! 等于多少？'),
        options: {
          A: { text: bilingual('120', '120') },
          B: { text: bilingual('15', '15'), hint: bilingual('Fifteen is the sum from 1 to 5. The definition calls for a product.', '15 是 1 到 5 的和。阶乘要把这些数相乘。') },
          C: { text: bilingual('24', '24'), hint: bilingual('That is 4!. Include the factor 5 to get 5!.', '24 是 4!。还要乘上 5 才是 5!。') },
        },
        correct: 'A',
        explanation: bilingual('5! = 5 × 4 × 3 × 2 × 1 = 120.', '5!＝5×4×3×2×1＝120。'),
        unlocked: bilingual('5! = 120.', '5!＝120。'),
      },
      {
        prompt: bilingual('What number multiplies 9! after you divide 120 by 12?', '120 除以 12 后，9! 前面的因数是多少？'),
        options: {
          A: { text: bilingual('120', '120'), hint: bilingual('One hundred twenty is 5!. You still need to divide by 12.', '120 是 5!；还需要除以 12。') },
          B: { text: bilingual('10', '10') },
          C: { text: bilingual('12', '12'), hint: bilingual('12 is the divisor. Check which number multiplied by 12 gives 120.', '12 是除数。看看哪个数乘以 12 等于 120。') },
        },
        correct: 'B',
        explanation: bilingual('120 ÷ 12 = 10, so N! = 10 × 9!. The large factorial can stay unexpanded.', '120÷12＝10，所以 N!＝10×9!。这里可以保留 9! 的写法。'),
        unlocked: bilingual('N! = 10 × 9!.', 'N!＝10×9!。'),
      },
      {
        prompt: bilingual('If N! = 10 × 9!, what is N?', '如果 N!＝10×9!，N 等于多少？'),
        options: {
          A: { text: bilingual('10', '10') },
          B: { text: bilingual('11', '11'), hint: bilingual('11! would have one more factor, 11. The largest factor shown here is 10.', '11! 还会多一个因数 11。这里最大的因数是 10。') },
          C: { text: bilingual('9', '9'), hint: bilingual('9! starts at 9. Multiplying by 10 extends the product up to 10.', '9! 从 9 起算。再乘上 10 后，乘积的起点是 10。') },
        },
        correct: 'A',
        explanation: bilingual('10 × 9! = 10 × 9 × … × 1 = 10!, so N = 10. No other positive integer has factorial 10!.', '10×9!＝10×9×…×1＝10!，所以 N＝10。其余正整数的阶乘都不等于 10!。'),
        unlocked: bilingual('N = 10.', 'N＝10。'),
      },
    ],
  },
  {
    sourceId: '2022Q8',
    monster: bilingual('Offset', '错位'),
    title: bilingual('Cancel matching factors in two products', '约掉两串乘积中的相同因数'),
    stem: bilingual(
      'What is the value of (1/3) × (2/4) × (3/5) × … × (18/20) × (19/21) × (20/22)?',
      '求 (1/3) × (2/4) × (3/5) × … × (18/20) × (19/21) × (20/22) 的值。',
    ),
    steps: [
      {
        prompt: bilingual('What is a useful way to organize all the factors?', '怎样整理所有因数，比较容易约分？'),
        options: {
          A: { text: bilingual('Add the numerators and add the denominators', '分别把分子相加、分母相加'), hint: bilingual('Each fraction is being multiplied. The top numbers form a product, and the bottom numbers form a product.', '这里是分数相乘。上面的数相乘，下面的数也相乘。') },
          B: { text: bilingual('Round every fraction before multiplying', '先把每个分数四舍五入，再相乘'), hint: bilingual('The question asks for an exact value. Keep the integer factors so you can cancel them.', '题目要求精确值。保留整数因数，才能找出可以约掉的部分。') },
          C: { text: bilingual('Combine the numerators and denominators into two products', '把分子、分母分别合成两个乘积') },
        },
        correct: 'C',
        explanation: bilingual('Multiply all numerators and all denominators separately, keeping their factors visible.', '分子分别相乘、分母分别相乘，先保留各因数的写法。'),
        unlocked: bilingual('Top: 1 × 2 × … × 20. Bottom: 3 × 4 × … × 22.', '分子：1×2×…×20。分母：3×4×…×22。'),
      },
      {
        prompt: bilingual('Which numbers appear in both products?', '哪一段数在分子和分母中都出现？'),
        options: {
          A: { text: bilingual('1 through 20', '1 到 20'), hint: bilingual('The denominator starts with 3. Neither 1 nor 2 appears there.', '分母从 3 开始，其中没有 1 或 2。') },
          B: { text: bilingual('3 through 20', '3 到 20') },
          C: { text: bilingual('3 through 22', '3 到 22'), hint: bilingual('The numerator ends at 20. It has no factors of 21 or 22 in the written sequence.', '分子写出的这串数到 20 为止，不包含 21 或 22。') },
        },
        correct: 'B',
        explanation: bilingual('The common range starts at 3 and ends at 20. Cancel one numerator factor against each identical denominator factor.', '两边都出现的是 3 到 20。分子、分母中相同的因数逐个约掉。'),
        unlocked: bilingual('Cancel the common factors 3 through 20.', '约掉两边共有的 3 到 20。'),
      },
      {
        prompt: bilingual('Which fraction remains after canceling 3 through 20?', '约掉 3 到 20 后，剩下哪个分数？'),
        options: {
          A: { text: bilingual('(1 × 2)/(21 × 22)', '(1×2)/(21×22)') },
          B: { text: bilingual('1/(21 × 22)', '1/(21×22)'), hint: bilingual('The 2 is also at the beginning of the numerator. There is no matching 2 among the listed denominator factors.', '分子开头还有一个 2。分母写出的这一串因数里没有可以配对的 2。') },
          C: { text: bilingual('(1 × 2)/22', '(1×2)/22'), hint: bilingual('Check both factors beyond 20 in the denominator. They both remain after the identical factors cancel.', '检查分母中大于 20 的两个因数。约掉相同的因数后，这两个数都保留。') },
        },
        correct: 'A',
        explanation: bilingual('Only 1 and 2 on top and 21 and 22 on the bottom remain, giving 2/462.', '分子剩下 1 和 2，分母剩下 21 和 22，得到 2/462。'),
        unlocked: bilingual('Remaining fraction: 2/462.', '剩下的分数是 2/462。'),
      },
      {
        prompt: bilingual('What is 2/462 in lowest terms?', '2/462 化成最简分数是多少？'),
        options: {
          A: { text: bilingual('1/462', '1/462'), hint: bilingual('If you halve the numerator, halve the denominator as well to preserve the value.', '分子除以 2 时，分母也要除以 2，才能保持分数值不变。') },
          B: { text: bilingual('1/132', '1/132'), hint: bilingual('Check the digits by multiplying your denominator by 2. It should give 462.', '把你的分母乘以 2 检查一下，应当得到 462。') },
          C: { text: bilingual('1/231', '1/231') },
        },
        correct: 'C',
        explanation: bilingual('Divide the numerator and denominator by 2 to get 1/231.', '分子和分母同时除以 2，得到 1/231。'),
        unlocked: bilingual('Product: 1/231.', '乘积是 1/231。'),
      },
    ],
  },
  {
    sourceId: '2025Q2',
    monster: bilingual('Glyph', '符符'),
    title: bilingual('Add the values of the symbols', '按符号查值，再相加'),
    stem: bilingual(
      'The key shows the ancient Egyptian hieroglyphs used for different numbers. For example, three arches and two strokes represent 32. What number is represented by the combination of hieroglyphs beneath the key?',
      '图中给出了古埃及数字象形符号与数值的对应关系。例如，三个拱形和两条竖线表示 32。图例下方的那组象形符号表示多少？',
    ),
    figure: {
      source: 'game/2025-hieroglyphs.webp',
      description: bilingual(
        'Key: bird 100,000, bent finger 10,000, lotus 1,000, coil 100, arch 10, stroke 1. The target row shows finger, coil, coil, coil, coil, arch, arch, stroke, stroke, stroke.',
        '图例：鸟形为 100,000，弯指形为 10,000，莲花形为 1,000，卷形为 100，拱形为 10，竖线为 1。题目中的符号依次为弯指、卷、卷、卷、卷、拱、拱、竖线、竖线、竖线。',
      ),
    },
    steps: [
      {
        prompt: bilingual('Which rule gives the value even if a symbol type is missing?', '如果有的符号没有出现，哪条规则仍能正确求出总值？'),
        options: {
          A: { text: bilingual('Use the total number of symbols as the answer', '把符号个数直接当成答案'), hint: bilingual('The example uses five symbols to give 32. The symbols have different values.', '例子用五个符号表示 32，所以每种符号有对应的数值。') },
          B: { text: bilingual('Use the key to find each symbol’s value and add the values', '按图例查出每个符号的数值，再相加') },
          C: { text: bilingual('Join the counts for symbols shown, skipping missing place values', '只把出现过的符号个数依次拼起来，跳过缺失的数位'), hint: bilingual('Read each symbol’s value from the key. A missing symbol type still has a contribution of zero.', '要按图例找到每个符号对应的数值；没出现的那类符号贡献为 0。') },
        },
        correct: 'B',
        explanation: bilingual('In the example, each arch is worth 10 and each stroke is worth 1. Their values add to 3 × 10 + 2 × 1 = 32.', '例子中，每个拱形表示 10，每条竖线表示 1，所以 3×10＋2×1＝32。'),
        unlocked: bilingual('Multiply each symbol’s value by its count, then add the contributions.', '每种符号的数值乘以个数，最后把各部分相加。'),
      },
      {
        prompt: bilingual('What is the combined value of the finger and the coils in the target row?', '题目中弯指形和卷形的数值合计是多少？'),
        options: {
          A: { text: bilingual('1,400', '1,400'), hint: bilingual('Check the key. The bent finger and the lotus have different values.', '看图例。弯指形与莲花形表示的数值不同。') },
          B: { text: bilingual('14,000', '14,000'), hint: bilingual('A coil is worth 100. The 1,000 symbol is the lotus.', '每个卷形表示 100；莲花形才表示 1,000。') },
          C: { text: bilingual('10,400', '10,400') },
        },
        correct: 'C',
        explanation: bilingual('One finger gives 10,000 and four coils give 4 × 100 = 400. Together they give 10,400.', '一个弯指形表示 10,000，四个卷形表示 4×100＝400，合计为 10,400。'),
        unlocked: bilingual('Finger and coils: 10,400.', '弯指形和卷形合计 10,400。'),
      },
      {
        prompt: bilingual('What is the combined value of the arches and strokes in the target row?', '题目中拱形和竖线的数值合计是多少？'),
        options: {
          A: { text: bilingual('23', '23') },
          B: { text: bilingual('5', '5'), hint: bilingual('There are five symbols in these two groups. Each arch contributes 10 and each stroke contributes 1.', '这两组共有五个符号，但每个拱形表示 10，每条竖线表示 1。') },
          C: { text: bilingual('32', '32'), hint: bilingual('The worked example has three arches and two strokes. Recount the arches in the target row.', '例子中是三个拱形、两条竖线。请重新数题目中拱形的个数。') },
        },
        correct: 'A',
        explanation: bilingual('Two arches and three strokes give 2 × 10 + 3 × 1 = 23.', '两个拱形和三条竖线表示 2×10＋3×1＝23。'),
        unlocked: bilingual('Arches and strokes: 23.', '拱形和竖线合计 23。'),
      },
      {
        prompt: bilingual('Add 10,400 and 23. What number do the symbols represent?', '把 10,400 和 23 相加。这组符号表示多少？'),
        options: {
          A: { text: bilingual('14,023', '14,023'), hint: bilingual('The coil contribution is 400, so it goes in the hundreds place.', '卷形合计为 400，所以 4 应在百位。') },
          B: { text: bilingual('10,423', '10,423') },
          C: { text: bilingual('14,230', '14,230'), hint: bilingual('Keep the smaller subtotal as 23, with 2 tens and 3 ones.', '较小的一部分是 23，其中 2 在十位、3 在个位。') },
        },
        correct: 'B',
        explanation: bilingual('The symbols add to 10,400 + 23 = 10,423.', '这些符号的数值之和为 10,400＋23＝10,423。'),
        unlocked: bilingual('The number is 10,423.', '这组符号表示 10,423。'),
      },
    ],
  },
];
