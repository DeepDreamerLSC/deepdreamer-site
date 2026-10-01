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
    const $=id=>document.getElementById(id);
    const lesson=$('lesson-dialog'), lessonOptions=$('lesson-options');
    if (!lesson || !lessonOptions) return;
    let lessonStage=0;
    const appendMessage=(type,html)=>{const node=document.createElement('div');node.className='msg '+type;node.innerHTML=html;lesson.appendChild(node);};
    const setLesson=(stage,label,buttons)=>{
        const restoreFocus=lessonOptions.contains(document.activeElement);
        lessonStage=stage;$('lesson-stage-label').textContent=label;$('lesson-progress').style.width=(stage===0?20:stage===1?55:100)+'%';
        lessonOptions.innerHTML='<div class="option-heading">'+(stage===2?'这一轮先到这里':'点选一句，继续试讲 ↓')+'</div>'+buttons.map(b=>'<button data-action="'+b.action+'"'+(b.reset?' class="reset"':'')+'>'+b.text+'</button>').join('');
        if(restoreFocus)lessonOptions.querySelector('button')?.focus();
    };
    const resetLesson=()=>{lesson.innerHTML='<div class="msg ai">如果你要把这道题讲给同学听，<b>你会先说什么？</b></div>';setLesson(0,'从你的想法开始',[{action:'answer',text:'每组 8 支。'},{action:'reason',text:'因为 48 支要平均分成 6 组，所以用 48 除以 6。'},{action:'stuck',text:'我知道要算，但不知道怎么讲。'}])};
    lessonOptions.addEventListener('click',event=>{const button=event.target.closest('button[data-action]');if(!button)return;const action=button.dataset.action;if(action==='reset'){resetLesson();return}if(lessonStage===0){if(action==='answer'){appendMessage('student','每组 8 支。');appendMessage('ai','你得到了结果。<b>为什么这里要用除法？</b>试着说说“平均分”和 6 组的关系。');setLesson(1,'再讲出为什么',[{action:'because',text:'因为 48 支平均分成 6 组，每组要一样多。'},{action:'hint',text:'请给我一点提示。'}])}else if(action==='reason'){appendMessage('student','因为 48 支要平均分成 6 组，所以用 48 除以 6。');appendMessage('ai','你讲出了用除法的理由。<b>那 48 ÷ 6 = 8 中的 8 代表什么？</b>');setLesson(1,'解释结果的意义',[{action:'meaning',text:'8 表示每一组有 8 支铅笔。'},{action:'hint',text:'我还不太确定。'}])}else{appendMessage('student','我知道要算，但不知道怎么讲。');appendMessage('ai','我们先只说第一步：<b>题目要把 48 支铅笔分成几组？</b>');setLesson(1,'从第一步说起',[{action:'six',text:'分成 6 组，而且每组一样多。'},{action:'hint',text:'还是需要一点提示。'}])}}else if(lessonStage===1){if(action==='hint'){appendMessage('student','我还需要一点提示。');appendMessage('ai','提示：先说清楚“总数”和“分成几组”，再说每组应当一样多。你可以重新组织一遍。');setLesson(2,'保持练习',[{action:'reset',text:'换一种回答，再试一次 ↺',reset:true}])}else{appendMessage('student',button.textContent);appendMessage('ai','这一次你补上了关键的数量关系。<b>我们听到了你的解释，</b>但仍需要结合完整讲题过程判断是否真的讲清楚。');setLesson(2,'已有表达证据',[{action:'reset',text:'重新开始试讲 ↺',reset:true}])}lesson.scrollTop=lesson.scrollHeight}});

    document.querySelector('#teaching [data-replay]')?.addEventListener('click', resetLesson);
    resetLesson();
})();
