import AdminPanelLayout from "../../../app/components/adminPanelLayout";
import { NextPageWithLayout } from "../../_app";

const ProductList : NextPageWithLayout = () => {
    return (
        <div>
            <h1>Users`s Page</h1>
        </div>
    )
}

ProductList.getLayout = (page) => <AdminPanelLayout>{page}</AdminPanelLayout>

export default ProductList;