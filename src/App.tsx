import {useEffect,useMemo,useRef,useState} from 'react'
import {initialQuestions,importQuestions,type Question} from './questions'

type Screen='home'|'setup'|'game'|'editor'|'result'
type Team={id:string;name:string;color:string;score:number}
const STORE='fio-da-bomba-questions-v1'
const teamColors=['#18d6c4','#ff4967','#8b68ff','#ffb526','#46a9ff','#ed69cf']
const wireColors=['#ef3e4f','#26a7ff','#f3c72f','#45d270','#a66bff','#ff7b24','#f273b8','#18c7c1','#f4f4f4','#81512d']
const bombs=[
 {tier:'PRETA',wires:4,points:1,skin:'black'}, {tier:'PRETA',wires:4,points:1,skin:'black'}, {tier:'PRETA',wires:4,points:1,skin:'black'},
 {tier:'PRATA',wires:7,points:2,skin:'silver'}, {tier:'PRATA',wires:7,points:2,skin:'silver'}, {tier:'PRATA',wires:7,points:2,skin:'silver'},
 {tier:'DOURADA',wires:10,points:3,skin:'gold'}
]

function useSound(enabled:boolean){const ctx=useRef<AudioContext|null>(null);return(type:'tick'|'cut'|'safe'|'boom'|'start'|'win')=>{if(!enabled)return;const A=window.AudioContext||(window as any).webkitAudioContext;ctx.current??=new A();const c=ctx.current!,now=c.currentTime;const tone=(f:number,t:number,d:number=.12,v=.08,w:OscillatorType='sine')=>{const o=c.createOscillator(),g=c.createGain();o.type=w;o.frequency.setValueAtTime(f,now+t);g.gain.setValueAtTime(v,now+t);g.gain.exponentialRampToValueAtTime(.001,now+t+d);o.connect(g).connect(c.destination);o.start(now+t);o.stop(now+t+d)};if(type==='tick')tone(900,0,.05,.035,'square');if(type==='cut'){tone(180,0,.08,.11,'sawtooth');tone(90,.05,.12,.08,'square')}if(type==='safe'){tone(520,0,.12,.08);tone(760,.12,.18,.08)}if(type==='start'){tone(220,0,.12,.08);tone(330,.13,.12,.08)}if(type==='win'){[523,659,784,1047].forEach((f,i)=>tone(f,i*.12,.3,.08))}if(type==='boom'){const len=c.sampleRate*.7,b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2);const s=c.createBufferSource(),g=c.createGain(),filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=420;g.gain.value=.42;s.buffer=b;s.connect(filter).connect(g).connect(c.destination);s.start()}}}

function useTrack(){
  const audio=useRef<HTMLAudioElement|null>(null)
  const key=useRef<string|null>(null)
  const play=(url:string,volume=0.4,loop=true)=>{
    if(key.current===url&&audio.current)return
    if(audio.current){audio.current.pause();audio.current.currentTime=0}
    const a=new Audio(url)
    a.loop=loop
    a.volume=volume
    void a.play().catch(()=>{})
    audio.current=a
    key.current=url
  }
  const stop=()=>{
    if(!audio.current)return
    audio.current.pause()
    audio.current.currentTime=0
    audio.current=null
    key.current=null
  }
  return {play,stop}
}

export default function App(){
 const [screen,setScreen]=useState<Screen>('home'),[questions,setQuestions]=useState<Question[]>(()=>{try{return JSON.parse(localStorage.getItem(STORE)||'null')||initialQuestions}catch{return initialQuestions}}),[names,setNames]=useState(['Equipe Alfa','Equipe Beta']),[teams,setTeams]=useState<Team[]>([]),[bombIndex,setBombIndex]=useState(0),[turnIndex,setTurnIndex]=useState(0),[question,setQuestion]=useState<Question|null>(null),[questionMode,setQuestionMode]=useState<'random'|'manual'>('random'),[manualIds,setManualIds]=useState<string[]>(Array(7).fill('')),[seconds,setSeconds]=useState(30),[status,setStatus]=useState<'armed'|'cutting'|'safe'|'exploded'>('armed'),[selected,setSelected]=useState<number|null>(null),[cutWires,setCutWires]=useState<number[]>([]),[blackTime,setBlackTime]=useState(30),[silverTime,setSilverTime]=useState(45),[goldTime,setGoldTime]=useState(60),[blackPoints,setBlackPoints]=useState(1),[silverPoints,setSilverPoints]=useState(2),[goldPoints,setGoldPoints]=useState(3),[sound,setSound]=useState(true),[used,setUsed]=useState<string[]>([])
const play=useSound(sound),music=useTrack(),bomb=bombs[bombIndex],team=teams[turnIndex%Math.max(teams.length,1)]
const isLastBomb=bombIndex===6
 useEffect(()=>{localStorage.setItem(STORE,JSON.stringify(questions))},[questions])
 useEffect(()=>{window.scrollTo({top:0,behavior:'instant'})},[screen,bombIndex])
 useEffect(()=>{
  if(!sound){music.stop();return}
  const base=import.meta.env.BASE_URL
  if(screen==='game'){
    if(isLastBomb){
      music.play(base+'audio/suspense-final.mp3',0.45,true)
    }else{
      music.play(base+'audio/suspense.mp3',0.30,true) // opcional; se não tiver esse arquivo, use suspense-final aqui também
    }
  }else if(screen==='result'){
    music.play(base+'audio/vitoria.mp3',0.55,false)
  }else{
    music.stop()
  }
},[screen,sound,isLastBomb])
 const coverage=useMemo(()=>({4:questions.filter(q=>q.type==='multiple'&&q.options?.length===4).length,7:questions.filter(q=>q.type==='multiple'&&q.options?.length===7).length,10:questions.filter(q=>q.type==='multiple'&&q.options?.length===10).length}),[questions])
 const manualReady=manualIds.every((id,index)=>questions.some(q=>q.id===id&&q.options?.length===bombs[index].wires))
 const pick=(index:number,already=used)=>{const n=bombs[index].wires,pool=questions.filter(q=>q.type==='multiple'&&q.options?.length===n&&!already.includes(q.id)),fallback=questions.filter(q=>q.type==='multiple'&&q.options?.length===n),list=pool.length?pool:fallback;return list[Math.floor(Math.random()*list.length)]||null}
 const timeFor=(index:number)=>index<3?blackTime:index<6?silverTime:goldTime
 const pointsFor=(index:number)=>index<3?blackPoints:index<6?silverPoints:goldPoints
 const questionFor=(index:number,already:string[])=>questionMode==='manual'?questions.find(q=>q.id===manualIds[index])||null:pick(index,already)
 const rotateTeam=()=>setTurnIndex(value=>(value+1)%Math.max(teams.length,1))
 const begin=()=>{const ready=names.map((n,i)=>({id:crypto.randomUUID(),name:n.trim(),color:teamColors[i],score:0})).filter(t=>t.name);if(ready.length<2||!coverage[4]||!coverage[7]||!coverage[10]||(questionMode==='manual'&&!manualReady))return;const first=questionFor(0,[]);setTeams(ready);setTurnIndex(0);setBombIndex(0);setUsed(first?[first.id]:[]);setQuestion(first);setSeconds(timeFor(0));setStatus('armed');setSelected(null);setCutWires([]);setScreen('game');play('start')}
 const advance=()=>{if(bombIndex===6){music.stop();play('win');setScreen('result');return}const next=bombIndex+1,q=questionFor(next,used);setBombIndex(next);setQuestion(q);setUsed(v=>q?[...v,q.id]:v);setSeconds(timeFor(next));setSelected(null);setCutWires([]);setStatus('armed');play('start')}
 const choose=(i:number)=>{if(status!=='armed'||!question||cutWires.includes(i))return;setSelected(i);setStatus('cutting');play('cut');setTimeout(()=>{const cutCorrect=question.options?.[i]===question.answer;if(cutCorrect){
  const remaining=bomb.wires-cutWires.length;
  if(remaining===2&&teams.length>1){
    const next=teams[(turnIndex+1)%teams.length];
    setTeams(v=>v.map(t=>t.id===next.id?{...t,score:t.score+pointsFor(bombIndex)}:t));
  }
  rotateTeam();
  setStatus('exploded');
  play('boom');
  setTimeout(advance,1900);
  return;
}
                                                                                                                                                       return}const nextCuts=[...cutWires,i];setCutWires(nextCuts);if(nextCuts.length===bomb.wires-1){setSelected(null);setStatus('safe');setTeams(v=>v.map(t=>t.id===team.id?{...t,score:t.score+pointsFor(bombIndex)}:t));rotateTeam();play('safe');setTimeout(advance,1900)}else{rotateTeam();setTimeout(()=>{setSelected(null);setStatus('armed')},450)}},600)}
 useEffect(()=>{if(screen!=='game'||status!=='armed')return;const timer=setInterval(()=>setSeconds(s=>{if(s<=1){clearInterval(timer);rotateTeam();setStatus('exploded');play('boom');setTimeout(advance,1900);return 0}if(s<=6)play('tick');return s-1}),1000);return()=>clearInterval(timer)},[screen,status,bombIndex])
 const soundButton=<button className="sound" onClick={()=>setSound(v=>!v)}>{sound?'◖)) Som + música':'◖– Sem som'}</button>
 if(screen==='home')return <Shell><main className="home"><div className="brand"><span className="brand-mark">✂</span><b>FIO DA</b><strong>BOMBA</strong></div><div className="hero-bomb"><div className="spark">✦</div><div className="fuse"/><div className="bomb-body black"><div className="timer-face">00:30</div><div className="bolts">••••</div></div></div><div className="intro"><span>DESAFIO EM EQUIPES</span><h1>Corte o fio.<br/><em>Salve a rodada.</em></h1><p>Sete bombas. Uma alternativa por fio. Uma escolha errada e tudo vai pelos ares.</p><div className="home-actions"><button className="primary" onClick={()=>setScreen('setup')}>Iniciar missão</button><button onClick={()=>setScreen('editor')}>Banco de perguntas <small>{questions.length}</small></button>{soundButton}</div></div></main></Shell>
 if(screen==='setup')return <Shell><main className="panel setup"><button className="back" onClick={()=>setScreen('home')}>← Voltar</button><div className="kicker">PREPARAÇÃO</div><h2>Monte as equipes</h2><p>A vez passa para a próxima equipe depois de cada fio cortado. Defina também tempo, pontuação e perguntas.</p><div className="team-list">{names.map((n,i)=><label key={i}><i style={{background:teamColors[i]}}>{i+1}</i><input value={n} maxLength={20} placeholder={`Equipe ${i+1}`} onChange={e=>setNames(v=>v.map((x,j)=>j===i?e.target.value:x))}/>{names.length>2&&<button onClick={()=>setNames(v=>v.filter((_,j)=>j!==i))}>×</button>}</label>)}</div>{names.length<6&&<button className="add" onClick={()=>setNames(v=>[...v,`Equipe ${v.length+1}`])}>＋ Adicionar equipe</button>}<div className="mission-map"><Stage n="01" label="3 bombas pretas" wires="4 fios" ok={coverage[4]>0} duration={blackTime} setDuration={setBlackTime} points={blackPoints} setPoints={setBlackPoints}/><Stage n="02" label="3 bombas prateadas" wires="7 fios" ok={coverage[7]>0} duration={silverTime} setDuration={setSilverTime} points={silverPoints} setPoints={setSilverPoints}/><Stage n="03" label="Bomba dourada" wires="10 fios" ok={coverage[10]>0} duration={goldTime} setDuration={setGoldTime} points={goldPoints} setPoints={setGoldPoints}/></div><section className="question-selection"><div><strong>Seleção das perguntas</strong><p>Use sorteio automático ou escolha uma pergunta para cada bomba.</p></div><div className="mode-buttons"><button className={questionMode==='random'?'active':''} onClick={()=>setQuestionMode('random')}>Aleatórias</button><button className={questionMode==='manual'?'active':''} onClick={()=>setQuestionMode('manual')}>Escolher manualmente</button></div></section>{questionMode==='manual'&&<div className="manual-questions">{bombs.map((item,index)=><label key={index}><span>Bomba {index+1} · {item.tier} · {item.wires} fios</span><select value={manualIds[index]} onChange={e=>setManualIds(values=>values.map((value,i)=>i===index?e.target.value:value))}><option value="">Escolha a pergunta</option>{questions.filter(q=>q.type==='multiple'&&q.options?.length===item.wires).map(q=><option key={q.id} value={q.id}>{q.prompt}</option>)}</select></label>)}</div>}{(!coverage[4]||!coverage[7]||!coverage[10])&&<div className="warning">O banco precisa ter ao menos uma pergunta com 4, uma com 7 e uma com 10 alternativas.</div>}{questionMode==='manual'&&!manualReady&&<div className="warning">Escolha uma pergunta válida para cada uma das sete bombas.</div>}<div className="setup-foot">{soundButton}<button onClick={()=>setScreen('editor')}>Editar perguntas</button><button className="primary" disabled={names.filter(x=>x.trim()).length<2||!coverage[4]||!coverage[7]||!coverage[10]||(questionMode==='manual'&&!manualReady)} onClick={begin}>Começar desarme</button></div></main></Shell>
 if(screen==='editor')return <Editor questions={questions} setQuestions={setQuestions} close={()=>setScreen('home')}/>
 if(screen==='result'){const max=Math.max(...teams.map(t=>t.score)),winners=teams.filter(t=>t.score===max);return <Shell><main className="result-screen"><div className="result-icon">✓</div><div className="kicker">MISSÃO ENCERRADA</div><h1>{winners.length>1?'Empate técnico':winners[0]?.name}</h1><p>{winners.length>1?winners.map(w=>w.name).join(' e '):'foi a equipe que mais desarmou bombas.'}</p><Scoreboard teams={teams}/><button className="primary" onClick={()=>setScreen('setup')}>Nova missão</button><button onClick={()=>setScreen('home')}>Voltar ao início</button></main></Shell>}
 return <Shell><main className={`game ${status}`}><header><div className="game-logo"><b>FIO DA BOMBA</b><span>{bomb.tier} · BOMBA {bombIndex+1}/7</span></div><div className="progress">{bombs.map((b,i)=><i key={i} className={`${b.skin} ${i===bombIndex?'current':''} ${i<bombIndex?'done':''}`}>{i<bombIndex?'✓':i+1}</i>)}</div>{soundButton}</header><section className="game-grid"><div className="bomb-zone"><div className="team-turn"><span style={{background:team?.color}}/>{team?.name}<b>+{pointsFor(bombIndex)} {pointsFor(bombIndex)===1?'ponto':'pontos'}</b></div><Bomb skin={bomb.skin} wires={bomb.wires} status={status} selected={selected} cutWires={cutWires} seconds={seconds}/><div className={`status-message ${status}`}>{status==='armed'?`${bomb.wires-cutWires.length} FIOS ATIVOS`:status==='cutting'?'CORTANDO O FIO...':status==='safe'?'BOMBA DESARMADA':'EXPLOSÃO!'}</div></div><div className="question-panel"><div className="question-meta"><span>{question?.category}</span><span>{question?.difficulty}</span><b>{bomb.wires-cutWires.length} {bomb.wires-cutWires.length===1?'FIO RESTANTE':'FIOS RESTANTES'}</b></div><h2>{question?.prompt}</h2><p><strong>{team?.name}</strong> corta um fio agora. Depois do corte, a vez passa à próxima equipe. Corte apenas respostas erradas.</p><div className={`answers count-${bomb.wires}`}>{question?.options?.map((option,i)=><button key={i} disabled={status!=='armed'||cutWires.includes(i)} className={`${selected===i?'selected':''} ${cutWires.includes(i)?'wire-cut':''}`} style={{'--wire':wireColors[i]} as React.CSSProperties} onClick={()=>choose(i)}><i>{cutWires.includes(i)?'×':String.fromCharCode(65+i)}</i><span>{option}</span><b/></button>)}</div></div></section><footer><Scoreboard teams={teams}/><button onClick={()=>confirm('Encerrar esta missão?')&&(music.stop(),setScreen('home'))}>Encerrar missão</button></footer></main></Shell>
}

function Stage({n,label,wires,ok,duration,setDuration,points,setPoints}:{n:string;label:string;wires:string;ok:boolean;duration:number;setDuration:(value:number)=>void;points:number;setPoints:(value:number)=>void}){return <div><b>{n}</b><span><strong>{label}</strong><small>{wires}</small><span className="stage-config"><label className="stage-time">Tempo <select aria-label={`Tempo para ${label}`} value={duration} onChange={e=>setDuration(Number(e.target.value))}>{[15,30,45,60,90,120].map(value=><option value={value} key={value}>{value} segundos</option>)}</select></label><label className="stage-time">Pontos <input aria-label={`Pontos para ${label}`} type="number" min="1" max="99" value={points} onChange={e=>setPoints(Math.max(1,Math.min(99,Number(e.target.value)||1)))}/></label></span></span><i className={ok?'ok':''}>{ok?'PRONTO':'SEM QUESTÃO'}</i></div>}
function Scoreboard({teams}:{teams:Team[]}){return <div className="scoreboard">{[...teams].sort((a,b)=>b.score-a.score).map(t=><div key={t.id}><i style={{background:t.color}}/><span>{t.name}</span><b>{t.score} pts</b></div>)}</div>}
function Bomb({skin,wires,status,selected,cutWires,seconds}:{skin:string;wires:number;status:string;selected:number|null;cutWires:number[];seconds:number}){
  const exploded = status === 'exploded';
  return <div className={`bomb-machine ${skin} ${status}`}>
    <div className="explosion">
      {Array.from({length:16},(_,i)=><i key={i} style={{'--i':i} as React.CSSProperties}/>)}
    </div>

    {!exploded && <>
      <div className="top-wire-bundle">
        {Array.from({length:wires},(_,i)=>
          <div
            className={`top-wire ${selected===i?'cutting-now':''} ${cutWires.includes(i)?'cut':''}`}
            key={i}
            style={{
              '--wire':wireColors[i],
              '--wire-x':`${(i-(wires-1)/2)*18}px`,
              '--wire-w':`${90+i*7}px`,
              '--wire-h':`${92+(i%3)*22}px`,
              '--wire-rot':`${(i-(wires-1)/2)*2}deg`
            } as React.CSSProperties}
          >
            <i/>
          </div>
        )}
      </div>

      <div className="fuse-box"><span/><span/><span/></div>

      <div className="bomb-shell">
        <div className="shine"/>
        <div className="display">
          <small>TEMPO</small>
          <b>{String(seconds).padStart(2,'0')}</b>
          <em>SEGUNDOS</em>
        </div>
        <div className="remaining-gauge">
          {Array.from({length:wires},(_,i)=>
            <i key={i} className={cutWires.includes(i)?'off':''}/>
          )}
        </div>
      </div>
    </>}
  </div>
}
function Shell({children}:{children:React.ReactNode}){return <div className="app"><div className="noise"/><div className="hazard top"/><div className="hazard bottom"/>{children}</div>}

function Editor({questions,setQuestions,close}:{questions:Question[];setQuestions:(q:Question[])=>void;close:()=>void}){
 const blank=()=>({prompt:'',answer:'',category:'Geral',difficulty:'Médio' as Question['difficulty'],count:4,options:Array(10).fill('')}),[form,setForm]=useState(blank),file=useRef<HTMLInputElement>(null)
 const add=()=>{const opts=form.options.slice(0,form.count).map(x=>x.trim());if(!form.prompt.trim()||!form.answer.trim()||opts.some(x=>!x)||!opts.includes(form.answer.trim())){alert('Preencha a pergunta, todas as alternativas e repita exatamente uma delas em “Resposta correta”.');return}setQuestions([{id:crypto.randomUUID(),type:'multiple',prompt:form.prompt.trim(),answer:form.answer.trim(),category:form.category.trim()||'Geral',difficulty:form.difficulty,options:opts},...questions]);setForm(blank())}
 const upload=(e:React.ChangeEvent<HTMLInputElement>)=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const q=importQuestions(JSON.parse(String(r.result)));setQuestions(q);alert(`${q.length} perguntas importadas.`)}catch(err){alert(err instanceof Error?err.message:'JSON inválido.')}finally{e.target.value=''}};r.readAsText(f)}
 const download=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(questions,null,2)],{type:'application/json'}));a.download='perguntas-fio-da-bomba.json';a.click();URL.revokeObjectURL(a.href)}
 return <Shell><main className="panel editor"><button className="back" onClick={close}>← Voltar</button><div className="editor-head"><div><div className="kicker">ARSENAL DE CONHECIMENTO</div><h2>Banco de perguntas</h2><p>Compatível com os mesmos formatos JSON do No Limite.</p></div><div><input ref={file} hidden type="file" accept="application/json" onChange={upload}/><button onClick={()=>file.current?.click()}>Importar JSON</button><button onClick={download}>Exportar JSON</button></div></div><div className="question-builder"><div className="count-picker">{[4,7,10].map(n=><button className={form.count===n?'active':''} onClick={()=>setForm({...form,count:n})} key={n}>{n} alternativas</button>)}</div><input className="full" placeholder="Pergunta" value={form.prompt} onChange={e=>setForm({...form,prompt:e.target.value})}/><input placeholder="Resposta correta (igual a uma alternativa)" value={form.answer} onChange={e=>setForm({...form,answer:e.target.value})}/><input placeholder="Categoria" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/><select value={form.difficulty} onChange={e=>setForm({...form,difficulty:e.target.value as Question['difficulty']})}><option>Fácil</option><option>Médio</option><option>Difícil</option></select><div className="option-grid">{form.options.slice(0,form.count).map((o,i)=><label key={i}><i style={{background:wireColors[i]}}>{String.fromCharCode(65+i)}</i><input placeholder={`Alternativa ${i+1}`} value={o} onChange={e=>setForm({...form,options:form.options.map((x,j)=>j===i?e.target.value:x)})}/></label>)}</div><button className="primary" onClick={add}>Adicionar ao banco</button></div><div className="bank-summary"><span><b>{questions.filter(q=>q.options?.length===4).length}</b> para bombas pretas</span><span><b>{questions.filter(q=>q.options?.length===7).length}</b> para bombas prateadas</span><span><b>{questions.filter(q=>q.options?.length===10).length}</b> para bomba dourada</span></div><div className="question-list">{questions.map(q=><article key={q.id}><i>{q.options?.length||0}</i><div><small>{q.category} · {q.difficulty}</small><b>{q.prompt}</b><span>Resposta: {q.answer}</span></div><button onClick={()=>setQuestions(questions.filter(x=>x.id!==q.id))}>×</button></article>)}</div></main></Shell>
}
