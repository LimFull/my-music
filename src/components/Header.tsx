'use client'

import styled from "styled-components";

function Header() {

    return <Container>v0.0.2</Container>
}

const Container = styled.header`
    position: fixed;
    top: 0;
    width: 100%;
    padding: 0 4px;
    text-align: right;
    color: rgb(172, 172, 172);
`

export default Header;