export type Locale = 'en' | 'zh';
export type Localized = Record<Locale, string>;
export type ChoiceKey = 'A' | 'B' | 'C';

export const choiceKeys = ['A', 'B', 'C'] as const;

export interface ChallengeOption {
  text: Localized;
  hint?: Localized;
}

export interface ChallengeStep {
  prompt: Localized;
  options: Record<ChoiceKey, ChallengeOption>;
  correct: ChoiceKey;
  explanation: Localized;
  unlocked: Localized;
}

export interface ChallengeEncounter {
  sourceId: string;
  monster: Localized;
  title: Localized;
  stem: Localized;
  steps: readonly [ChallengeStep, ChallengeStep, ChallengeStep];
}

const bilingual = (en: string, zh: string): Localized => ({ en, zh });

export const encounters: readonly ChallengeEncounter[] = [
  {
    sourceId: '2005Q1',
    monster: bilingual('Sprout', '芽芽'),
    title: bilingual('Undo an operation', '用逆运算还原原数'),
    stem: bilingual(
      'Connie multiplies a number by 2 and gets 60 as her answer. However, she should have divided the number by 2 to get the correct answer. What is the correct answer?',
      'Connie 把一个数乘以 2，得到 60。她本应该把这个数除以 2。正确的结果是多少？',
    ),
    steps: [
      {
        prompt: bilingual('How should you use the mistaken result of 60?', '怎样处理误算得到的 60？'),
        options: {
          A: {
            text: bilingual('Halve 60 and stop', '把 60 除以 2 就结束'),
            hint: bilingual(
              'One division recovers the starting number. Next, divide the starting number by 2 as instructed.',
              '除一次可以找回原数。接下来按题意把原数除以 2。',
            ),
          },
          B: { text: bilingual('Undo the mistake, then follow the instruction', '先撤销错误运算，再按题意计算') },
          C: {
            text: bilingual('Double the mistaken result', '把错误的结果再乘以 2'),
            hint: bilingual('What operation takes a doubled number back to its starting value?', '一个数已经乘以 2，要用什么运算才能找回原数？'),
          },
        },
        correct: 'B',
        explanation: bilingual('First undo the doubling. Then divide the starting number by 2 as instructed.', '先用除法撤销错误的乘法，再按题意把原数除以 2。'),
        unlocked: bilingual('Undo the doubling, then halve the starting number.', '先还原原数，再把原数除以 2。'),
      },
      {
        prompt: bilingual('What was the starting number?', '原数是多少？'),
        options: {
          A: { text: bilingual('30', '30') },
          B: {
            text: bilingual('15', '15'),
            hint: bilingual('Check by doubling your choice. Does it give 60?', '把你选的数乘以 2，看看能不能得到 60。'),
          },
          C: {
            text: bilingual('120', '120'),
            hint: bilingual('Undo doubling by dividing 60 by 2.', '要撤销乘以 2，就把 60 除以 2。'),
          },
        },
        correct: 'A',
        explanation: bilingual('The starting number is 60 ÷ 2 = 30.', '用 60 ÷ 2 找回原数 30。'),
        unlocked: bilingual('The starting number is 60 ÷ 2 = 30.', '原数是 60 ÷ 2 = 30。'),
      },
      {
        prompt: bilingual('The starting number is 30. What result do you get when you divide it by 2 as instructed?', '原数是 30。按题意除以 2，结果是多少？'),
        options: {
          A: {
            text: bilingual('7.5', '7.5'),
            hint: bilingual('Apply the intended division just once to the starting number, 30.', '从原数 30 开始，按题意除以 2 一次。'),
          },
          B: {
            text: bilingual('30', '30'),
            hint: bilingual('You have found the starting number. Now divide it by 2.', '你已经找到了原数。接下来把它除以 2。'),
          },
          C: { text: bilingual('15', '15') },
        },
        correct: 'C',
        explanation: bilingual('Divide the starting number, 30, by 2 to get 15.', '按题意把原数 30 除以 2，得到 15。'),
        unlocked: bilingual('The correct result is 30 ÷ 2 = 15.', '正确结果是 30 ÷ 2 = 15。'),
      },
    ],
  },
  {
    sourceId: '2008Q1',
    monster: bilingual('Pebble', '石仔'),
    title: bilingual('Find both costs before subtracting', '先求两笔花费，再算剩余'),
    stem: bilingual(
      'Susan had $50 to spend at the carnival. She spent $12 on food and twice as much on rides. How many dollars did she have left to spend?',
      'Susan 有 50 美元可以在游乐会上花。她在食物上花了 12 美元，在游乐项目上花的钱是食物的两倍。她还剩多少美元？',
    ),
    steps: [
      {
        prompt: bilingual('Which plan finds the amount left?', '哪种方法能求出剩下的钱？'),
        options: {
          A: {
            text: bilingual('Treat the two costs as equal', '把两笔花费看成相等'),
            hint: bilingual('“Twice as much” tells you to double the food cost to find the ride cost.', '“两倍”表示用食物的花费乘以 2，就能求出游乐项目的花费。'),
          },
          B: {
            text: bilingual('Subtract only the ride cost from $50', '从 50 美元中只减去游乐费'),
            hint: bilingual('There are two expenses. Where does the $12 for food fit into the plan?', '题目中有两笔花费。食物花的 12 美元也要放进计算里。'),
          },
          C: { text: bilingual('Find the ride cost, then subtract both costs', '先求游乐费，再扣掉两笔花费') },
        },
        correct: 'C',
        explanation: bilingual('Find the ride cost from the food cost. Then subtract both expenses from the $50 budget.', '用食物的花费求出游乐费，再从 50 美元的预算里扣除两笔花费。'),
        unlocked: bilingual('Double $12 to find the ride cost, then subtract both costs.', '先把 12 美元翻倍求游乐费，再扣除两笔花费。'),
      },
      {
        prompt: bilingual('Food cost $12. The rides cost twice as much. How much did the rides cost?', '餐费是 12 美元，游乐费是餐费的两倍。游乐费是多少？'),
        options: {
          A: { text: bilingual('$24', '24 美元') },
          B: {
            text: bilingual('$12', '12 美元'),
            hint: bilingual('$12 is the food cost. Double it to find the ride cost.', '12 美元是食物的花费。把它乘以 2 就能求出游乐费。'),
          },
          C: {
            text: bilingual('$36', '36 美元'),
            hint: bilingual('$36 includes food and rides. This step asks for just the rides.', '36 美元包含食物和游乐项目。这一步只问游乐费。'),
          },
        },
        correct: 'A',
        explanation: bilingual('The rides cost 2 × $12 = $24.', '游乐费是 12 × 2 = 24 美元。'),
        unlocked: bilingual('Food costs $12. Rides cost 2 × $12 = $24.', '食物花了 12 美元，游乐项目花了 12 × 2 = 24 美元。'),
      },
      {
        prompt: bilingual('Susan spent $12 + $24 = $36. How much money does she have left?', 'Susan 一共花了 12 + 24 = 36 美元。她还剩多少钱？'),
        options: {
          A: {
            text: bilingual('$26', '26 美元'),
            hint: bilingual('$50 − $24 accounts for the rides. Include the food cost too.', '50 − 24 已经扣除了游乐费，还要扣除食物的花费。'),
          },
          B: { text: bilingual('$14', '14 美元') },
          C: {
            text: bilingual('$38', '38 美元'),
            hint: bilingual('$50 − $12 accounts for the food. Include the ride cost too.', '50 − 12 已经扣除了食物的花费，还要扣除游乐费。'),
          },
        },
        correct: 'B',
        explanation: bilingual('The total spent is $12 + $24 = $36. Subtract $36 from $50 to get $14.', '两笔一共花了 12 + 24 = 36 美元。从 50 美元中扣掉 36 美元，剩下 14 美元。'),
        unlocked: bilingual('Susan has $50 − ($12 + $24) = $14 left.', 'Susan 还剩 50 − (12 + 24) = 14 美元。'),
      },
    ],
  },
  {
    sourceId: '2014Q1',
    monster: bilingual('Nimbus', '云团'),
    title: bilingual('Follow the order of operations', '按运算顺序计算'),
    stem: bilingual(
      'Harry and Terry are each told to calculate 8 − (2 + 5). Harry gets the correct answer. Terry ignores the parentheses and calculates 8 − 2 + 5. If Harry’s answer is H and Terry’s answer is T, what is H − T?',
      'Harry 和 Terry 都要计算 8 − (2 + 5)。Harry 算对了。Terry 忽略括号，计算的是 8 − 2 + 5。设 Harry 的答案是 H，Terry 的答案是 T，H − T 等于多少？',
    ),
    steps: [
      {
        prompt: bilingual('Which rule fits both expressions?', '哪条运算规则适用于这两个算式？'),
        options: {
          A: { text: bilingual('Parentheses first, then add or subtract left to right', '先算括号，括号外加减从左到右') },
          B: {
            text: bilingual('Always add before subtracting', '加法总比减法先算'),
            hint: bilingual('Addition and subtraction have the same priority. Without parentheses, start on the left.', '加法和减法同级。没有括号时，从左边开始算。'),
          },
          C: {
            text: bilingual('Always go left to right', '两个算式都直接从左到右'),
            hint: bilingual('Look at Harry’s expression. What must you calculate inside the parentheses?', '看看 Harry 的算式。括号里有什么需要先算？'),
          },
        },
        correct: 'A',
        explanation: bilingual('Start with 2 + 5 for Harry. Start with 8 − 2 for Terry.', 'Harry 先算括号中的 2 + 5。Terry 的算式没有括号，从左边的 8 − 2 开始。'),
        unlocked: bilingual('Harry starts with 2 + 5. Terry starts with 8 − 2.', 'Harry 先算 2 + 5。Terry 先算 8 − 2。'),
      },
      {
        prompt: bilingual('What value does Harry get for 8 − (2 + 5)?', 'Harry 算出的 8 − (2 + 5) 等于多少？'),
        options: {
          A: {
            text: bilingual('11', '11'),
            hint: bilingual('11 comes from going left to right. Start inside Harry’s parentheses.', '11 是直接从左到右算出的结果。Harry 的算式要先算括号。'),
          },
          B: { text: bilingual('1', '1') },
          C: {
            text: bilingual('7', '7'),
            hint: bilingual('7 is the sum inside the parentheses. Use it to finish the subtraction.', '7 是括号里的和。把它代回去，完成减法。'),
          },
        },
        correct: 'B',
        explanation: bilingual('Harry gets H = 8 − 7 = 1. Terry’s expression goes left to right, so T = (8 − 2) + 5 = 11.', 'Harry 先算括号，得到 H = 8 − 7 = 1。Terry 从左到右算，得到 T = (8 − 2) + 5 = 11。'),
        unlocked: bilingual('H = 8 − (2 + 5) = 1. T = (8 − 2) + 5 = 11.', 'H = 8 − (2 + 5) = 1，T = (8 − 2) + 5 = 11。'),
      },
      {
        prompt: bilingual('Using H = 1 and T = 11, what is H − T?', '已知 H = 1、T = 11，H − T 等于多少？'),
        options: {
          A: {
            text: bilingual('10', '10'),
            hint: bilingual('Start at H = 1 on a number line and move 11 units left.', '在数轴上从 H = 1 出发，向左移动 11 格。'),
          },
          B: {
            text: bilingual('12', '12'),
            hint: bilingual('The question uses subtraction. Start from H and subtract T.', '题目问的是差。从 H 出发，减去 T。'),
          },
          C: { text: bilingual('−10', '−10') },
        },
        correct: 'C',
        explanation: bilingual('Substitute H = 1 and subtract T = 11 to get −10.', '代入 H = 1，再减去 T = 11，得到 −10。'),
        unlocked: bilingual('The difference is H − T = 1 − 11 = −10.', '两数的差为 H − T = 1 − 11 = −10。'),
      },
    ],
  },
];
