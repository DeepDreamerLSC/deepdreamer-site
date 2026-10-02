// Fixed local examples. No model calls, storage, or live product data.
(() => {
  'use strict';

    const examples={parking:{message:'刚刚停车 112 元，帮我记一下。',amount:'− ¥112',category:'交通 · 停车',note:'刚刚停车',reply:'我整理好了一笔支出。请先核对金额和分类。'},coffee:{message:'今天买咖啡花了 28 元。',amount:'− ¥28',category:'餐饮 · 饮品',note:'咖啡',reply:'这笔饮品支出已整理，请确认后再入账。'},salary:{message:'把 4 月份奖金 500 元记入账本。',amount:'+ ¥500',category:'收入 · 奖金',note:'4 月份奖金',reply:'我识别到一笔收入，金额和类别需要你确认。'}};
    let currentExample='parking';
    const $=id=>document.getElementById(id);
    if (!$('finance-confirm')) return;
    document.querySelectorAll('.preset').forEach(button=>button.addEventListener('click',()=>{currentExample=button.dataset.example;const e=examples[currentExample];$('finance-message').textContent=e.message;$('receipt-amount').textContent=e.amount;$('receipt-category').textContent=e.category;$('receipt-note').textContent=e.note;$('finance-reply').textContent=e.reply;$('receipt-type').textContent='待确认';$('receipt-state').textContent='尚未入账';const confirm=$('finance-confirm');confirm.textContent='确认这笔记录 ↗';confirm.classList.remove('done');document.querySelectorAll('.preset').forEach(item=>{item.classList.toggle('active',item===button);item.setAttribute('aria-pressed',String(item===button))})}));
    $('finance-confirm').addEventListener('click',()=>{const confirm=$('finance-confirm');if(confirm.classList.contains('done'))return;confirm.classList.add('done');confirm.textContent='✓ 已在演示中确认';$('receipt-type').textContent='已确认';$('receipt-state').textContent='演示记录';$('finance-reply').textContent='这笔示意记录已确认。真实账本不会被修改。'});

    document.querySelector('#finance [data-replay]')?.addEventListener('click', () => document.querySelector('.preset[data-example=parking]')?.click());
    document.querySelectorAll('.preset').forEach(button => button.setAttribute('aria-pressed', String(button.classList.contains('active'))));
})();

(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const lesson = $('lesson-dialog'), options = $('lesson-options'), summary = $('lesson-summary');
  if (!lesson || !options || !summary) return;
  let stage = 0;
  function message(type, html) {
    const node = document.createElement('div');
    node.className = 'msg ' + type;
    node.innerHTML = html;
    lesson.appendChild(node);
    lesson.scrollTop = lesson.scrollHeight;
  }
  function setStage(next, label, choices) {
    const restoreFocus = options.contains(document.activeElement);
    stage = next;
    $('lesson-stage-label').textContent = label;
    $('lesson-progress').style.width = [15, 40, 70, 100][next] + '%';
    options.innerHTML = '<div class="option-heading">' + (next === 3 ? '这一轮留下了什么' : '点选一句，继续试讲 ↓') + '</div>' + choices.map(choice => '<button data-action="' + choice.action + '">' + choice.text + '</button>').join('');
    if (restoreFocus) options.querySelector('button')?.focus();
  }
  function finish(complete) {
    message('ai', complete ? '你把数量关系和结果的意义连起来了。<b>我们把你这次的表达留下来。</b>下一次，试着换一道题独立讲解。' : '今天先到这里。<b>我们记录你已经说出的部分，</b>下一次继续把理由讲出来。');
    const evidence = [...lesson.querySelectorAll('.msg.student')].map(node => {
      const item = document.createElement('li');
      item.textContent = node.textContent;
      return item;
    });
    $('lesson-evidence').replaceChildren(...evidence);
    $('lesson-next').textContent = complete ? '下一步：换一道题，练习独立解释。这个短示例不代表已经掌握。' : '下一步：继续说明为什么用除法，以及结果表示什么。';
    summary.hidden = false;
    setStage(3, complete ? '本次讲解记录' : '仍需练习', [{action: 'reset', text: '重新开始试讲 ↺'}]);
  }
  function reset() {
    lesson.innerHTML = '<div class="msg ai">如果你要把这道题讲给同学听，<b>你会先说什么？</b></div>';
    summary.hidden = true;
    $('lesson-evidence').replaceChildren();
    setStage(0, '从你的想法开始', [
      {action: 'answer', text: '每组 8 支。'},
      {action: 'reason', text: '因为 48 支要平均分成 6 组，所以用 48 除以 6。'},
      {action: 'stuck', text: '我知道要算，但不知道怎么讲。'}
    ]);
  }
  options.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'reset') { reset(); return; }
    message('student', button.textContent);
    if (action === 'pause') { finish(false); return; }
    if (action === 'hint') {
      message('ai', '我们先缩小一步：<b>总共有多少支，要平均分成几组？</b>把这两个数和“每组一样多”连起来说。');
      setStage(1, '先讲清数量关系', [{action: 'because', text: '48 支平均分成 6 组，每组一样多，所以用除法。'}, {action: 'pause', text: '这次先停在这里。'}]);
    } else if (stage === 0) {
      const prompts = {
        answer: ['你得到了结果。<b>为什么这里要用除法？</b>', 'because', '因为 48 支平均分成 6 组，每组要一样多。'],
        reason: ['你说出了运算理由。<b>算出的 8，代表什么？</b>', 'meaning', '8 表示每一组有 8 支铅笔。'],
        stuck: ['先只讲第一步：<b>题目要分成几组，每组有什么要求？</b>', 'six', '分成 6 组，而且每组一样多。']
      };
      const [prompt, next, text] = prompts[action];
      message('ai', prompt);
      setStage(1, '补上关键理由', [{action: next, text}, {action: 'hint', text: '请给我一点提示。'}]);
    } else if (stage === 1) {
      message('ai', '现在试着连起来：<b>为什么用除法、怎样计算、结果表示什么？</b>把这道题讲给同学听。');
      setStage(2, '把思路连起来', [{action: 'recap', text: '48 支平均分成 6 组，要算每组有多少，所以用 48 ÷ 6 = 8。8 表示每组有 8 支铅笔。'}, {action: 'pause', text: '我还没办法完整讲出来，这次先停。'}]);
    } else if (stage === 2 && action === 'recap') finish(true);
  });
  document.querySelector('#teaching [data-replay]')?.addEventListener('click', reset);
  reset();
})();
