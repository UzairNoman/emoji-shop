import React, { Component } from "react"
import Faces from "./Faces"
import env from "./Environment";
import LoadingDots from "./LoadingDots";
import './style/style.css';
class Home extends Component {
    baseUrl = env.baseUrl;
    constructor(props) {
        super(props);
        this.state = {
            pageNumber: 1,
            pageSize: 20,
            totalProductCount: 0,
            products: [],
            buffer: [],
            randomAd : "",
            isLoading: true,
            sort: null,
            selectOptions: [
                { hiddenValue: null, visibleValue: "Select sorting option" },
                { hiddenValue: "price", visibleValue: "Price" },
                { hiddenValue: "id", visibleValue: "ID" },
                { hiddenValue: "size", visibleValue: "Size" }
            ]
        }
    }
    componentWillMount() {
        this.loadFirstFetch();
    }
    componentDidUpdate(){
   
        
    }
    componentDidMount() {
        document.addEventListener('scroll', this.trackScrolling);
    }

    componentWillUnmount() {
        document.removeEventListener('scroll', this.trackScrolling);
    }
    trackScrolling = () => {
        let { pageNumber, buffer, products, isLoading,totalProductCount,pageSize } = this.state;
        let userReachedBtm = (window.innerHeight + window.scrollY) >= document.body.offsetHeight;
        console.log(products.length);
        let hasMore = products.length <= (totalProductCount + (totalProductCount/pageSize) - 1);
        if (userReachedBtm && !isLoading && hasMore) {
            console.log("scroll");
            console.log(buffer);
            this.setState({
                products: products.concat(buffer),
                pageNumber: pageNumber + 1,
            },()=>this.loadBuffer())
        }

    };
    loadBuffer() {  
        console.log("bunffer");
        this.setState({
            isLoading : true
        })
        fetch(this.endpointConstruct())
            .then(response => {
                return response.json()
            })
            .then(res => {
                this.setState({
                    isLoading : false
                })
                let buffer = res.concat(this.randomAd());
                console.log("bufferring",buffer);
                this.setState({ buffer });
                window.scrollBy(0, -5);
            });
    }
    endpointConstruct(){
        let { pageNumber, pageSize, sort } = this.state;
        let endpoint =   `${this.baseUrl}/products?_page=${pageNumber}&_limit=${pageSize}`;
        endpoint = sort !== null ? `${endpoint}&_sort=${sort}` : endpoint;
        
        return endpoint;
    }
    loadFirstFetch() {
        console.log("loadFirstFetch");
        let { pageNumber, pageSize } = this.state;
        fetch(this.endpointConstruct())
            .then(response => {
                this.setState({
                    totalProductCount: +response.headers.get('X-Total-Count')
                });
                return response.json()
            })
            .then(res => {
                let products = res.concat(this.randomAd());           
                this.setState({ products, isLoading: false });
            }).then(() => {
                this.setState({ pageNumber: pageNumber + 1 },() => this.loadBuffer());
               
            });
    }
    handleOnChange(e){
        this.setState({
            products : [],
            buffer : [],
            isLoading : true,
            pageNumber : 1,
            sort : e.target.value
        },() => {
            this.loadFirstFetch();
        });

    }
    randomAd() {
        const { randomAd } = this.state;
        let rid;
        do{
            rid = Math.floor(Math.random() * 1000);
        }while(randomAd === rid); 
        this.setState({ randomAd: rid });
    
        return { rid };
      }
    render() {
        let { products, selectOptions,isLoading,totalProductCount,pageSize } = this.state;
        let sponsorsId = Math.floor(Math.random()*1000);
        let sponsors = `${this.baseUrl}/ads/?r=${sponsorsId}`
        return (
            <div>
                <header className="navbar">
                    <h1>Products Grid</h1>
                </header>
                <section className="products">
                <p>Here you're sure to find a bargain on some of the finest ascii available to purchase. Be sure to peruse our selection of ascii faces in an exciting range of sizes and prices.</p>
                <p>But first, a word from our sponsors:</p> 
                <img class="sponsors" src={sponsors} />
                    <div className="sort">
                        <span>Sort by : </span>
                        <select onChange={this.handleOnChange.bind(this)}>
                            {
                            selectOptions.map((selectOption) =>
                                <option key={selectOption.hiddenValue} value={selectOption.hiddenValue}>
                                    {selectOption.visibleValue}
                                </option>
                            )
                            }
                        </select>
                    </div>
                    <Faces products={products} isLoading={isLoading} totalProductCount={totalProductCount} pageSize={pageSize} ></Faces>
                </section>            
            </div>
        )
    }
}
export default Home;