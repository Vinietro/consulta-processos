export const runtime = 'nodejs';

export const GET = handler;
export const OPTIONS = handler;

const tribunais = [
  'tst',
  'tse',
  'stj',
  'stm',
  'trf1',
  'trf2',
  'trf3',
  'trf4',
  'trf5',
  'trf6',
  'tjac',
  'tjal',
  'tjam',
  'tjap',
  'tjba',
  'tjce',
  'tjdft',
  'tjes',
  'tjgo',
  'tjma',
  'tjmg',
  'tjms',
  'tjmt',
  'tjpa',
  'tjpb',
  'tjpe',
  'tjpi',
  'tjpr',
  'tjrj',
  'tjrn',
  'tjro',
  'tjrr',
  'tjrs',
  'tjsc',
  'tjse',
  'tjsp',
  'tjto',
  'trt1',
  'trt2',
  'trt3',
  'trt4',
  'trt5',
  'trt6',
  'trt7',
  'trt8',
  'trt9',
  'trt10',
  'trt11',
  'trt12',
  'trt13',
  'trt14',
  'trt15',
  'trt16',
  'trt17',
  'trt18',
  'trt19',
  'trt20',
  'trt21',
  'trt22',
  'trt23',
  'trt24',
  'tre-ac',
  'tre-al',
  'tre-am',
  'tre-ap',
  'tre-ba',
  'tre-ce',
  'tre-dft',
  'tre-es',
  'tre-go',
  'tre-ma',
  'tre-mg',
  'tre-ms',
  'tre-mt',
  'tre-pa',
  'tre-pb',
  'tre-pe',
  'tre-pi',
  'tre-pr',
  'tre-rj',
  'tre-rn',
  'tre-ro',
  'tre-rr',
  'tre-rs',
  'tre-sc',
  'tre-se',
  'tre-sp',
  'tre-to',
  'tjmmg',
  'tjmrs',
  'tjmsp',
]

async function handler(req: Request) {
  if(process.env.API_KEY){
    const numeroProcesso = req.url.split('/').pop()

    if(!numeroProcesso){
      return Response.json({ numeroProcesso: 'Número do processo não informado' })
    }

    const res = await fetch('https://api-publica.datajud.cnj.jus.br/api_publica_tjsp/_search', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'APIKey ' + process.env.API_KEY
      },
      body: JSON.stringify({
        query: {
          match: {
              numeroProcesso
          }
      }
      }),
      method: 'POST'
    })
    let data = await res.json()

    if(data?.hits?.hits?.length === 0){
      const responses = await Promise.all(tribunais.map(tribunal => fetch(`https://api-publica.datajud.cnj.jus.br/api_publica_${tribunal}/_search`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'APIKey ' + process.env.API_KEY
        },
        body: JSON.stringify({
          query: {
            match: {
                numeroProcesso
            }
        }
        }),
        method: 'POST'
      })))

      const datas = []

      for(const response of responses){
        datas.push(await response.json())
      }

      console.log(datas)

      data = datas.find(data => data?.hits?.hits?.length > 0)
    }

    const body = {
      numeroProcesso: data?.hits?.hits?.[0]?._source?.numeroProcesso,
      classe: data?.hits?.hits?.[0]?._source?.classe?.nome,
      assuntos: data?.hits?.hits?.[0]?._source?.assuntos?.map((assunto: any) => assunto.nome).join(', '),
      movimento: data?.hits?.hits?.[0]?._source?.movimentos?.pop()?.nome
    }

    return Response.json(body?.numeroProcesso ? body : { numeroProcesso: 'Processo não encontrado' })
  }
 

  return Response.json({ numeroProcesso: 'Não foi possível buscar o processo, fale com um advogado' })
}
