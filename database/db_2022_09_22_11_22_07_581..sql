PGDMP         ;                z            oauth_server    12.6 (Debian 12.6-1.pgdg100+1)    14.2 -    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    16538    oauth_server    DATABASE     `   CREATE DATABASE oauth_server WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'en_US.utf8';
    DROP DATABASE oauth_server;
                postgres    false                        2615    2200    public    SCHEMA        CREATE SCHEMA public;
    DROP SCHEMA public;
                postgres    false            �           0    0    SCHEMA public    COMMENT     6   COMMENT ON SCHEMA public IS 'standard public schema';
                   postgres    false    4            �            1255    16701 "   set_current_timestamp_updated_at()    FUNCTION     �   CREATE FUNCTION public.set_current_timestamp_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$;
 9   DROP FUNCTION public.set_current_timestamp_updated_at();
       public          postgres    false    4            �            1255    16730 
   set_main()    FUNCTION     �   CREATE FUNCTION public.set_main() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.main == true THEN
    UPDATE auth_roles SET main = false WHERE auth_id == NEW.auth_id;
  END IF;
  RETURN NEW;
END;
$$;
 !   DROP FUNCTION public.set_main();
       public          postgres    false    4            �            1255    16826    update_defaults()    FUNCTION     �   CREATE FUNCTION public.update_defaults() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.by_default = true THEN
    UPDATE public.role SET by_default = false WHERE code <> NEW.code;
  END IF;
  RETURN NEW;
END;
$$;
 (   DROP FUNCTION public.update_defaults();
       public          postgres    false    4                        1255    16733    update_mains()    FUNCTION     �   CREATE FUNCTION public.update_mains() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.main = true THEN
    UPDATE public.auth_role SET main = false WHERE auth_id = NEW.auth_id AND role_code <> NEW.role_code;
  END IF;
  RETURN NEW;
END;
$$;
 %   DROP FUNCTION public.update_mains();
       public          postgres    false    4            �            1259    16683    auth    TABLE     �  CREATE TABLE public.auth (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    email character varying NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    password text NOT NULL,
    salt text NOT NULL,
    username character varying,
    provider character varying DEFAULT 'local'::character varying NOT NULL,
    photo_url text,
    mobile character varying,
    refresh_token text,
    email_verification_code character varying,
    email_verification_expiration integer,
    sms_verification_code character varying,
    sms_verification_expiration integer,
    reset_password_code character varying,
    reset_password_expiration integer,
    social_id text,
    last_login_at timestamp with time zone,
    disabled boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    mobile_verified boolean DEFAULT false NOT NULL
);
    DROP TABLE public.auth;
       public         heap    postgres    false    4    4    4            �           0    0 
   TABLE auth    COMMENT     ;   COMMENT ON TABLE public.auth IS 'Authentication accounts';
          public          postgres    false    212            �            1259    16714 	   auth_role    TABLE     �   CREATE TABLE public.auth_role (
    auth_id uuid NOT NULL,
    role_code character varying NOT NULL,
    main boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
    DROP TABLE public.auth_role;
       public         heap    postgres    false    4            �           0    0    TABLE auth_role    COMMENT     @   COMMENT ON TABLE public.auth_role IS 'auth-roles relationship';
          public          postgres    false    214            �            1259    16735    lambdas    TABLE     �  CREATE TABLE public.lambdas (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    type character varying DEFAULT 'jwt_populate'::character varying NOT NULL,
    function text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    code character varying NOT NULL
);
    DROP TABLE public.lambdas;
       public         heap    postgres    false    4    4    4            �           0    0    TABLE lambdas    COMMENT     8   COMMENT ON TABLE public.lambdas IS 'Lambdas functions';
          public          postgres    false    215            �            1259    16703    role    TABLE     D  CREATE TABLE public.role (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    code character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    by_default boolean DEFAULT false NOT NULL
);
    DROP TABLE public.role;
       public         heap    postgres    false    4    4    4            �           0    0 
   TABLE role    COMMENT     .   COMMENT ON TABLE public.role IS 'User roles';
          public          postgres    false    213            �          0    16683    auth 
   TABLE DATA           h  COPY public.auth (id, email, email_verified, password, salt, username, provider, photo_url, mobile, refresh_token, email_verification_code, email_verification_expiration, sms_verification_code, sms_verification_expiration, reset_password_code, reset_password_expiration, social_id, last_login_at, disabled, created_at, updated_at, mobile_verified) FROM stdin;
    public          postgres    false    212   K;       �          0    16714 	   auth_role 
   TABLE DATA           U   COPY public.auth_role (auth_id, role_code, main, created_at, updated_at) FROM stdin;
    public          postgres    false    214   �L       �          0    16735    lambdas 
   TABLE DATA           Y   COPY public.lambdas (id, name, type, function, created_at, updated_at, code) FROM stdin;
    public          postgres    false    215   �O       �          0    16703    role 
   TABLE DATA           R   COPY public.role (id, name, code, created_at, updated_at, by_default) FROM stdin;
    public          postgres    false    213   4Q       E           2606    16698    auth auth_email_key 
   CONSTRAINT     O   ALTER TABLE ONLY public.auth
    ADD CONSTRAINT auth_email_key UNIQUE (email);
 =   ALTER TABLE ONLY public.auth DROP CONSTRAINT auth_email_key;
       public            postgres    false    212            G           2606    16696    auth auth_pkey 
   CONSTRAINT     L   ALTER TABLE ONLY public.auth
    ADD CONSTRAINT auth_pkey PRIMARY KEY (id);
 8   ALTER TABLE ONLY public.auth DROP CONSTRAINT auth_pkey;
       public            postgres    false    212            Q           2606    16810 )   auth_role auth_role_auth_id_role_code_key 
   CONSTRAINT     r   ALTER TABLE ONLY public.auth_role
    ADD CONSTRAINT auth_role_auth_id_role_code_key UNIQUE (auth_id, role_code);
 S   ALTER TABLE ONLY public.auth_role DROP CONSTRAINT auth_role_auth_id_role_code_key;
       public            postgres    false    214    214            S           2606    16815    auth_role auth_role_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.auth_role
    ADD CONSTRAINT auth_role_pkey PRIMARY KEY (auth_id, role_code);
 B   ALTER TABLE ONLY public.auth_role DROP CONSTRAINT auth_role_pkey;
       public            postgres    false    214    214            I           2606    16700    auth auth_username_key 
   CONSTRAINT     U   ALTER TABLE ONLY public.auth
    ADD CONSTRAINT auth_username_key UNIQUE (username);
 @   ALTER TABLE ONLY public.auth DROP CONSTRAINT auth_username_key;
       public            postgres    false    212            U           2606    16756    lambdas lambdas_code_key 
   CONSTRAINT     S   ALTER TABLE ONLY public.lambdas
    ADD CONSTRAINT lambdas_code_key UNIQUE (code);
 B   ALTER TABLE ONLY public.lambdas DROP CONSTRAINT lambdas_code_key;
       public            postgres    false    215            W           2606    16748    lambdas lambdas_name_key 
   CONSTRAINT     S   ALTER TABLE ONLY public.lambdas
    ADD CONSTRAINT lambdas_name_key UNIQUE (name);
 B   ALTER TABLE ONLY public.lambdas DROP CONSTRAINT lambdas_name_key;
       public            postgres    false    215            Y           2606    16746    lambdas lambdas_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.lambdas
    ADD CONSTRAINT lambdas_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.lambdas DROP CONSTRAINT lambdas_pkey;
       public            postgres    false    215            K           2606    16753    role role_code_key 
   CONSTRAINT     M   ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_code_key UNIQUE (code);
 <   ALTER TABLE ONLY public.role DROP CONSTRAINT role_code_key;
       public            postgres    false    213            M           2606    16713    role roles_name_key 
   CONSTRAINT     N   ALTER TABLE ONLY public.role
    ADD CONSTRAINT roles_name_key UNIQUE (name);
 =   ALTER TABLE ONLY public.role DROP CONSTRAINT roles_name_key;
       public            postgres    false    213            O           2606    16805    role roles_pkey 
   CONSTRAINT     M   ALTER TABLE ONLY public.role
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);
 9   ALTER TABLE ONLY public.role DROP CONSTRAINT roles_pkey;
       public            postgres    false    213            _           2620    16821 )   auth_role set_public_auth_role_updated_at    TRIGGER     �   CREATE TRIGGER set_public_auth_role_updated_at BEFORE UPDATE ON public.auth_role FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
 B   DROP TRIGGER set_public_auth_role_updated_at ON public.auth_role;
       public          postgres    false    214    254            �           0    0 4   TRIGGER set_public_auth_role_updated_at ON auth_role    COMMENT     �   COMMENT ON TRIGGER set_public_auth_role_updated_at ON public.auth_role IS 'trigger to set value of column "updated_at" to current timestamp on row update';
          public          postgres    false    2911            \           2620    16702    auth set_public_auth_updated_at    TRIGGER     �   CREATE TRIGGER set_public_auth_updated_at BEFORE UPDATE ON public.auth FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
 8   DROP TRIGGER set_public_auth_updated_at ON public.auth;
       public          postgres    false    212    254            �           0    0 *   TRIGGER set_public_auth_updated_at ON auth    COMMENT     �   COMMENT ON TRIGGER set_public_auth_updated_at ON public.auth IS 'trigger to set value of column "updated_at" to current timestamp on row update';
          public          postgres    false    2908            a           2620    16749 %   lambdas set_public_lambdas_updated_at    TRIGGER     �   CREATE TRIGGER set_public_lambdas_updated_at BEFORE UPDATE ON public.lambdas FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
 >   DROP TRIGGER set_public_lambdas_updated_at ON public.lambdas;
       public          postgres    false    254    215            �           0    0 0   TRIGGER set_public_lambdas_updated_at ON lambdas    COMMENT     �   COMMENT ON TRIGGER set_public_lambdas_updated_at ON public.lambdas IS 'trigger to set value of column "updated_at" to current timestamp on row update';
          public          postgres    false    2913            ]           2620    16813    role set_public_role_updated_at    TRIGGER     �   CREATE TRIGGER set_public_role_updated_at BEFORE UPDATE ON public.role FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
 8   DROP TRIGGER set_public_role_updated_at ON public.role;
       public          postgres    false    254    213            �           0    0 *   TRIGGER set_public_role_updated_at ON role    COMMENT     �   COMMENT ON TRIGGER set_public_role_updated_at ON public.role IS 'trigger to set value of column "updated_at" to current timestamp on row update';
          public          postgres    false    2909            ^           2620    16827    role update_default_to_all    TRIGGER     �   CREATE TRIGGER update_default_to_all BEFORE INSERT OR UPDATE ON public.role FOR EACH ROW EXECUTE FUNCTION public.update_defaults();
 3   DROP TRIGGER update_default_to_all ON public.role;
       public          postgres    false    253    213            `           2620    16734    auth_role update_main_to_all    TRIGGER     �   CREATE TRIGGER update_main_to_all BEFORE INSERT OR UPDATE ON public.auth_role FOR EACH ROW EXECUTE FUNCTION public.update_mains();
 5   DROP TRIGGER update_main_to_all ON public.auth_role;
       public          postgres    false    214    256            [           2606    16797 "   auth_role auth_role_role_code_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.auth_role
    ADD CONSTRAINT auth_role_role_code_fkey FOREIGN KEY (role_code) REFERENCES public.role(code) ON UPDATE RESTRICT ON DELETE CASCADE;
 L   ALTER TABLE ONLY public.auth_role DROP CONSTRAINT auth_role_role_code_fkey;
       public          postgres    false    2891    213    214            Z           2606    16720 !   auth_role auth_roles_auth_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.auth_role
    ADD CONSTRAINT auth_roles_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES public.auth(id) ON UPDATE RESTRICT ON DELETE CASCADE;
 K   ALTER TABLE ONLY public.auth_role DROP CONSTRAINT auth_roles_auth_id_fkey;
       public          postgres    false    212    2887    214            �      x��YGSc�]�_�ŷs=q;��L9 ���H	���}�]#ʸ��A���>��~1�"��8%;-d�|��c��!���a2z�>���H���.\����W{�[[�O,���Y\�U�K�^����Nim���M�K!�Q��UEKʕLqFx�2E�$B�9�����m�1�)9����q0�}p���|�jT�V'�+�Ƶ�,xf�:�b�$!p��Ș��1	�����ۻ�p�����d�K�_����萗.��(��痣��^��@�M�xs}���aw#�_����ax<X���%���=IRvĝ�	����>+������ֹ�m*�m��'�N���E�ԩH�4��;Fz���f+��䤏�K��(G���!h����`�F�I�*��*$���`� �Jp�T�|$<��)^�騣�N�,��;%�0�$멚�D�.q¯��OZ:]U����E9
x� }�_`���`I���^Y]*G��lg�Ѭ��<�VMӪYt���Ɩ��ϙ��n����&|��P��}\�sI�\C�B�Y:G�]��EX�M��ۧ��^�?�d|��<�C���T�Y���]J^�6VJr�#������d���I�ꬎ�$��e (SI:DY����!���r!�ו��`���r���xYb�m$g(���1љ�bʘ�+�DR��D�>������P����x~���C,��n������C>Y?;�(�;y���i�yq�W��v���/���/�6��4���yl&ST���/�~��#)$-0���kAwR�M�]jA�>[�J~��?O�[-�/��C��w�F �4u�&�9��%J��;�x�}P��Rqm�� E� �������k�S�*�P�9���I�z���P�,>y%\FPJi0j ���
����&ZSC��}���X�B��!�L1;!�"'�3tQ/.���T�:@�dS��ƫw7I../_.^��;�o����᳭ǂ77GWw���=^�E>�xxz�=�%��� �!�s��%]�+�;%l�4K��B���J��Y�`4Q��n\��Z����A������h�1aؕ!%�P� ^#�5V`��Jg[����Z
ւoS��%��c���iHc�d3�B���H�"H�YI�b3-� `J���WҠZ�I�]�*3�d��h~;�8���pA�n���޵�W���˴=�8��#^�1b�jM�����M�4��蓴`�G��sE������u�]��tdRN�9�	f��J*x����WX76ܹh�UI{6�}*c�s*�pv�,� Ӈ_�mE[�<�R��`S�
��,a�l��Ԛ���C�Xv�c�Y����`\��XV�F6BD_g	j)I	��e�����~���w�6����i���C-oꛭgu����xv���x1��^_��'�4�F��es��',�]�s�J��u��!o�ӘtQɤ�(hg�%�P���Z�o���,�'p�"�mRs1�m)�Y)UQ��!�FU��E�
=2��f���퇐D�`j�
h�K0AJksY��B�DU@@ 
�C��:�,@<(x�.Ь����ʶ�c���������z�zcP���^��x�^�^����r�'��RNn��`z�r����(�@����(��Q�U`�,@�s:�E���	��ys���Wn&
��LT���N��)P�	�	3� ջQ�Q��Bc"C#8�D2!�������zrqRH�&�M�B.]-�M�FX	Z�E��!�K��*mdA��?�]��)N3���-�jLEm���Y�/0:<*W��y=�m��V8��;~���^���x�d{)���������`�A�}#����u�E��uΦf�:�d;]X��إ�+4�1��w�����#��D9لB��qn�$�����lB��R�w�R�4@!���4 C"E�ʠ�Y��p_Y�_9�$*ª��.��?s�V(-�<�+��V
���� '��5��|(5B���A)ae��ɾ�(�ӧ�Ձ^��o��x�8����'�����ts��d��ɗ���/�Wu�M�ĂDm�D��#F�63��U���C�霑0#B�RH��;HrV�� �V�l��k	e�41�3^9A��!P�JD{$jF^�pA�Z8jp���U-��8,*'=�-��)�S��6�J��s�Fe�A�b,Ut�-��H)�/�Tt�F��FF����B �P���l��s�P6k�͛���q��d��^G[σ�qx�o.ί��������[�o�n�|��H�z?�ֹ�5@�ƘN#�wȳ���#�����c4�#$�4o�\]D�)슐��� ��
��������
д����q�`pP�
�ϑ�M���l\?4���Z�W�F��.�W��%_+�t��U�KF��֋�%����8H����k�w��_�L �:_��#Iu���28ڭ[��E����[9q������|_����-6�uV�FK����R���AUB�E�E$��3 �`�F��.y����`��F̓�gl��S	�@�R���\�"�#���A@���rC�0�Ҩ}��$I�UC�X*5	^h{�Ф!u�d5�-�4��H��VU��;H��Fa��Sj�F	���_�����e��w��ugdo�{o7�ʽ����nn��\#�ԩ^>]���>H�-��J�>�B�j�6t`��� �F�FL	����f�.#s(�����3t�Bb(`��S�U�B������h%y����� ,���,��F��n����|���i��ԯ�2��pQ�W�V�q�в�CЯ(��� �o�*l,Z�`�[��HO���prZn�"\D�||z�/���)�Ã����y}o�5ￔ���g��� 	zf��	���>��I����|��p�Rt(2��C�3�N�Ģ�F����A�C�@f�5�����B�KY#舤�Nerl� _(A�-K).��B��=U����@�^�>l�A�	��ꄘ��a���/Dm3�����bz:&�[D��� iwYO���y�z~��cq�?
���KOe�q�:��椿�?Z��]^,�<���a���}������I)�Ǔ�Z��*s�:�x�!�u� ��I����]Bf+];�nG��I�������脢�C�-<���9,sm<*i�^&e�>Z
�k�{�PAU���7� T�JI��6{2$��*��R���lu��s8�1s�h���EmaN �7M��uZ~r:9��{��Í�������t�y`��y?����wG�ߗ��}�,����}H��' }XH�!B�v(�5�輴�s�b�]
!��f�r-p�5�?�	�)M{�n�#M�}�4׎v�O
��O1h��C��"�*O�%�"�J��1�b���օ�B.�Di�i���	� �1 �\X'9G|�M�t����nGː�v51UII��uQ��+&=�i=o�d�v�h��b9�Q���i�f}��~8X����,�����:�g��]���E}�U�?W�B�ҖL��C���)���/f@�=*���j8��2����g8�j���B5BHu-������ж,=JKm�C�,Q�S�M�r&B�QZ�T ��Аڹ8�ɠ'���=�ڄ��q�>ZiE9㌹A�G�����c������$�;}Y{���׏F�ye��R���d�����G[�&�D>�\�S��^W.���H�P���>��9�76����yRP�G���q~���]g��=2	&"`�_4r�"Bc�ۙF�r!�R��Y���]�?"yds�?�-�P���ފ��b����P�6')0&�[V�)v�Q��{�U���_B7B�
��=��,��g�u&��hDI6�恭�*8�������x��_N���xp�y׿������e�l}s�|[�Lo���ppxz�����`��?��g }X�s&�m�f���U]p5th���C�f�$��$����J�eU���I�n�@��d�q�I^g�^4�d�@��ۭ��I�0��
(W�+�{���En�L�aj�cu(U5Fӫ U  �K������<4a�"jSrKU�A��W��h��8Q�����@��n����ϳ���U�����6���ɖ?�zUq�����ux6X}�6H���*��>,�9�ʢȺ.®[��DF�*�aa�����	9ے��A ��)s���8�^�4�i7���ڑ�RY�PhXjA+scPƀc��E�D�B�/ʀZ���o�@��t���¶���I���P(����*��3�8H�.�Nh8�.�������7����;+Y���ry�N�W�hU�o�WV�Ô�M�Ǔ����|~uaP�������iA�����H�!���zZ_Iİ_gy������P��      �   �  x��U��$7<�{j$[��~�\d�9�.���G�,	3=3	�V��J�2v�u� ��AE`��$m�b}����/�`)�H���m/f���?(�'҃�(�#5�-�����������Ǐ.��pB�o��qy�w�`�Ԝ1�����r��ivԔ�{�檏\t�c��0�`*|z��m6e����4?��RMJ{�u�n=f��zzh���00r�cy���G-׽���+��g�s�bJb�%=l�R_�M���J1zBune�j�|hnk6�n�P�<�h㥃�a�+ٹU�G��Vl���x�*��(L/�Y���<�i
Ok�v�B���ӹD�Э�0g8BY@���S�I��I�8i�O��э'a^�w����-c�kv³5|�%r[G���-C6�4�ue�v�.�pD��f�|Ǖ��v��(�����W�j�}�m��S!�'�f��o��Ӫ�K���qE�1���C�E��<�s�f3�re��	>�u�n�H,�3s����w�^���n���@:*���K6.�悕�qe��W]��1�0���o���YQ�;��n⣘�[��m_Q�3~P�u����2�9��ڮV��rE75�rqT��N��ky_"��\%�/{AS�d�nDU�������_Y��YRm�����Ǩ�Od݃�J�,�.|c��c�3k��}ї��Ҧ�Sv͵v/���m���,��      �   �  x��RMs�0<��xҩ��BP:��K�=jǉ$�t00!��8��&��ؾ��nv��,\�,(d�*��O8���{E�,�~�V���)�b�{��eY�uN5�e�L�($8u����jv	~���ЂH9�Z��JYiP*!SQ�$�BB��lh?A�h��.eKq]+	,m�� I�U��v�~dЅ�f��y��l�|5Mnh���M�҂�N+>�k�k��*�L�nLHӞ�vZ�����]�V��  ���K2��1�Q�3�i_N���fd�I���[e����g�s��E��{������v��K۹ܶn�����ֹvq=_rmi~��퉎Kh.h�G��0�^ q ��Q��#����h�X��8@d��С�K���@�~�#�      �   �   x���1�0@�99;r��N�tC\�%i�-R[�]� �����4�Ł�F�DpE���W�V�y��c����|�!$����qd�0r�"���SG����XO�6MX�[�* �;d�	j.0L;��sn����ޏ�Ҷ���}���l8�     