import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const ValidadorPublico = () => {
    const { id } = useParams();
    const [promo, setPromo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getPromo() {
            if (!id) return;
            
            const { data, error } = await supabase
                .from('promociones')
                .select('*')
                .eq('id', id)
                .single();
            
            if (data) {
                setPromo(data);
            }
            setLoading(false);
        }
        getPromo();
    }, [id]);

    if (loading) return <pre>{"{ \"mensaje\": \"cargando...\" }"}</pre>;
    if (!promo) return <pre>{"{ \"error\": \"Inexistente\" }"}</pre>;

    return (
        <pre style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap', backgroundColor: '#fff', color: '#000', padding: '10px' }}>
            {JSON.stringify(promo)}
        </pre>
    );
};

export default ValidadorPublico;