import axios from 'axios'
const plugUrl = 'https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=0x0&boolean=true&apikey=SRVNN4NYDVHSW3GFMKKUPS3S9SP56572MM'

const blocksCaller = async (arr) => {
    let resultArr = arr.filter(el=> typeof el == 'object')
    let urlsArr = arr.filter(el=> typeof el == 'string')
    while (urlsArr[0]) {
        const tempArr = urlsArr.splice(0, 5)

            while (tempArr.length!==0 && tempArr.length < 5) {
                //Небольшой костыль: если колчество ответов с ошибкой рейт лимита не кратно 5, то мы пушим запрос-затычку, которую откинем в последующем коде,
                // чтобы была возможность отправлять 5 запросов одновременно
                tempArr.push(plugUrl)
            }
        const result = await Promise.all([
            axios.get(tempArr[0]),
            axios.get(tempArr[1]),
            axios.get(tempArr[2]),
            axios.get(tempArr[3]),
            axios.get(tempArr[4]),
            new Promise((res) => setTimeout(() => {res(1)}, 1500))
        ])
            .then((res) => {
                res.pop()
                return res.map(el => {
                    if (typeof el.data.result == 'string') {
                        console.log('Max rate limit error')
                        return ('https://'+el.request.host + el.request.path)
                    }
                    if(typeof el.data.result.number =='undefined'){
                        console.log('Undefined response')
                        return ('https://'+el.request.host + el.request.path)
                    }
                    return el.data.result
                })
            })
            .catch(e => console.log(e))
        resultArr.push(...result)
    }

    if(resultArr.filter(el=> typeof el == 'string').length !== 0){
        return await blocksCaller(resultArr)
    }
    return resultArr
}

const getLastBlock = () => {
      return Promise.all([
          axios.get('https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=SRVNN4NYDVHSW3GFMKKUPS3S9SP56572MM'),
          new Promise((res) => setTimeout(() => {res(1)}, 2000))
      ])
        .then(res => {
            return res[0].data.result
        })
        .catch(e => console.log(e));
}
class statsController {

   async getMaxBalance(req,res) {
       try{
           let addressBalance = {}
           let blocksToCallArr = []
           const n = await getLastBlock()
           let counter = n
           while (n - counter < 100) {
               blocksToCallArr.push(`https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=${counter}&boolean=true&apikey=SRVNN4NYDVHSW3GFMKKUPS3S9SP56572MM`)
               counter = '0x'+ (counter-1).toString(16)
           }
           let blocksResponse = await blocksCaller(blocksToCallArr)
           blocksResponse.filter(el=> el.number!=='0x0')
               .map(el=> el.transactions)
               .flat(1)
               .forEach(el=>{
                       if (!addressBalance.hasOwnProperty(el.from)) {
                           addressBalance[el.from] = {balance: parseInt(el.value, 16)}
                       } else {
                           addressBalance[el.from].balance += parseInt(el.value, 16)
                       }
                       if (!addressBalance.hasOwnProperty(el.to)) {
                           addressBalance[el.to] = {balance: parseInt(el.value, 16)}
                       } else {
                           addressBalance[el.to].balance += parseInt(el.value, 16)
                       }
               })

           const maxAddressBalance = Object.keys(addressBalance).reduce((acc, curr) =>
               acc.balance ? (addressBalance[curr].balance > acc.balance ? addressBalance[curr] : acc) : curr, {});
           res.json(maxAddressBalance)
       } catch (e) {
           console.log(e)
       }
    }
}

export default new statsController()