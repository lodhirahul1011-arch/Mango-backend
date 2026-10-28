const {createApp,loadEnvironment}=require('./app.cjs');
loadEnvironment();
const app=createApp();
app.get('/api/health',(req,res)=>res.json({status:'ok',service:'pio-backend'}));
app.use((req,res)=>res.status(404).json({message:'Endpoint not found'}));
const server=app.listen(Number(process.env.PORT||5000),'0.0.0.0',()=>console.log('PIO backend ready'));
for(const signal of ['SIGINT','SIGTERM']) process.once(signal,()=>server.close(()=>process.exit(0)));
