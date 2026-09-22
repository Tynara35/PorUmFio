export type Question={id:string;category:string;difficulty:'Fácil'|'Médio'|'Difícil';type:'multiple'|'open';prompt:string;answer:string;options?:string[]}
export const initialQuestions:Question[]=[
{id:'1',category:'Ciências',difficulty:'Fácil',type:'multiple',prompt:'Qual planeta é conhecido como Planeta Vermelho?',answer:'Marte',options:['Vênus','Marte','Júpiter','Saturno']},
{id:'2',category:'Geografia',difficulty:'Fácil',type:'multiple',prompt:'Qual é a capital do Brasil?',answer:'Brasília',options:['Rio de Janeiro','Salvador','Brasília','São Paulo']},
{id:'3',category:'História',difficulty:'Médio',type:'multiple',prompt:'Em qual continente surgiu a civilização egípcia?',answer:'África',options:['Ásia','Europa','África','América']},
{id:'4',category:'Conhecimentos gerais',difficulty:'Médio',type:'multiple',prompt:'Qual destas cores não está na bandeira brasileira?',answer:'Roxo',options:['Verde','Amarelo','Azul','Branco','Roxo','Vermelho','Laranja']},
{id:'5',category:'Ciências',difficulty:'Médio',type:'multiple',prompt:'Qual destes animais é um mamífero?',answer:'Baleia',options:['Tubarão','Polvo','Baleia','Pinguim','Sardinha','Tartaruga','Lula']},
{id:'6',category:'Geografia',difficulty:'Difícil',type:'multiple',prompt:'Qual destes países fica na América do Sul?',answer:'Uruguai',options:['México','Espanha','Japão','Uruguai','Canadá','Egito','Portugal']},
{id:'7',category:'Final',difficulty:'Difícil',type:'multiple',prompt:'Qual destes números é primo?',answer:'29',options:['21','25','27','29','33','35','39','49','51','55']}
]
const str=(v:unknown)=>String(v??'').trim()
export function normalize(raw:any,index:number):Question|null{
 const prompt=str(raw.prompt??raw.pergunta??raw.q??raw.p);let options=raw.options??raw.alternativas??raw.opcoes
 if(!options&&Array.isArray(raw.a))options=raw.a
 const correct=raw.correct??raw.c
 const explicit=typeof raw.answer==='string'?raw.answer:typeof raw.resposta==='string'?raw.resposta:typeof raw.a==='string'?raw.a:typeof correct==='string'?correct:''
 const finalAnswer=str(explicit||(Array.isArray(options)&&Number.isInteger(correct)&&correct>=0&&correct<options.length?options[correct]:''))
 if(!prompt||!finalAnswer)return null
 const cleanOptions=Array.isArray(options)?options.map(str).filter(Boolean):undefined
 return{id:str(raw.id)||`import-${Date.now()}-${index}`,category:str(raw.category??raw.categoria??raw.c)||'Geral',difficulty:(['Fácil','Médio','Difícil'].includes(str(raw.difficulty??raw.dificuldade))?str(raw.difficulty??raw.dificuldade):'Médio') as Question['difficulty'],type:cleanOptions&&cleanOptions.length>1?'multiple':'open',prompt,answer:finalAnswer,options:cleanOptions}
}
export function importQuestions(data:any):Question[]{const list=Array.isArray(data)?data:Array.isArray(data.questions)?data.questions:Array.isArray(data.perguntas)?data.perguntas:[];const out=list.map(normalize).filter(Boolean) as Question[];if(!out.length)throw new Error('Nenhuma pergunta válida foi encontrada.');return out}
